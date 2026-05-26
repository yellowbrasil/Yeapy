#!/usr/bin/env python3
"""
Setup GitHub Actions for automatic deployment
Execute: python3 setup-github-actions.py
"""

import os
import sys
import subprocess
import json
import base64
from pathlib import Path

# Config
REPO_OWNER = "yellowbrasil"
REPO_NAME = "Yeapy"
VPS_HOST = "69.62.93.231"
VPS_USER = "root"
SSH_KEY_PATH = Path.home() / ".ssh" / "id_rsa"

def run_command(cmd):
    """Run command and return output"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode

def get_github_token():
    """Get GitHub token from environment or user input"""
    token = os.getenv("GITHUB_TOKEN")
    if token:
        print("✓ GitHub token found in GITHUB_TOKEN environment variable")
        return token

    print("\n❌ GITHUB_TOKEN environment variable not found")
    print("\nTo create a GitHub token:")
    print("1. Go to: https://github.com/settings/tokens")
    print("2. Click: 'Generate new token (classic)'")
    print("3. Name: 'GitHub Actions Deploy'")
    print("4. Scopes: repo, workflow")
    print("5. Click: 'Generate token'")
    print("6. Copy the token and paste below:\n")

    token = input("Paste GitHub token: ").strip()
    if not token:
        print("❌ Token required!")
        sys.exit(1)

    return token

def get_ssh_key():
    """Get SSH private key"""
    if SSH_KEY_PATH.exists():
        print(f"✓ SSH key found: {SSH_KEY_PATH}")
        with open(SSH_KEY_PATH, 'r') as f:
            return f.read()

    print(f"❌ SSH key not found at {SSH_KEY_PATH}")
    print("\nGenerate SSH key with:")
    print(f"  ssh-keygen -t rsa -b 4096 -f {SSH_KEY_PATH} -N ''")
    sys.exit(1)

def add_github_secret(token, name, value):
    """Add secret to GitHub repository"""
    print(f"\nAdding secret: {name}...")

    # Encode value in base64
    encoded_value = base64.b64encode(value.encode()).decode()

    # Get public key for encryption
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/actions/secrets/public-key"
    cmd = f"""curl -s -H "Authorization: token {token}" "{url}" """

    output, code = run_command(cmd)
    if code != 0:
        print(f"❌ Error getting public key")
        return False

    try:
        key_data = json.loads(output)
        public_key = key_data["key"]
        key_id = key_data["key_id"]
    except:
        print(f"❌ Error parsing public key response")
        return False

    # Encrypt value
    try:
        import nacl.utils
        import nacl.public

        public_key_obj = nacl.public.PublicKey(public_key, encoder=nacl.encoding.Base64Encoder)
        sealed_box = nacl.public.SealedBox(public_key_obj)
        encrypted = sealed_box.encrypt(value.encode())
        encoded_secret = base64.b64encode(bytes(encrypted)).decode()
    except:
        print("❌ Required: pip install pynacl")
        print("   Run: pip3 install pynacl")
        sys.exit(1)

    # Create secret
    payload = {
        "encrypted_value": encoded_secret,
        "key_id": key_id
    }

    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/actions/secrets/{name}"
    cmd = f"""curl -s -X PUT \\
      -H "Authorization: token {token}" \\
      -H "Accept: application/vnd.github.v3+json" \\
      "{url}" \\
      -d '{json.dumps(payload)}'"""

    output, code = run_command(cmd)

    if code == 0 or "created" in output.lower() or "updated" in output.lower():
        print(f"✓ Secret added: {name}")
        return True
    else:
        print(f"❌ Error adding secret {name}")
        print(output)
        return False

def main():
    print("=" * 60)
    print("GitHub Actions - Auto Deploy Setup")
    print("=" * 60)

    # Check if workflow file exists
    workflow_path = Path(".github/workflows/deploy.yml")
    if not workflow_path.exists():
        print("❌ Workflow file not found!")
        print("Make sure you're in the project root directory")
        sys.exit(1)

    print("✓ Workflow file found: .github/workflows/deploy.yml")

    # Get inputs
    print("\n" + "=" * 60)
    print("Step 1: Get GitHub Token")
    print("=" * 60)
    token = get_github_token()

    print("\n" + "=" * 60)
    print("Step 2: Get SSH Private Key")
    print("=" * 60)
    ssh_key = get_ssh_key()

    # Add secrets
    print("\n" + "=" * 60)
    print("Step 3: Adding Secrets to GitHub")
    print("=" * 60)

    secrets = {
        "VPS_HOST": VPS_HOST,
        "VPS_SSH_KEY": ssh_key,
    }

    for name, value in secrets.items():
        if not add_github_secret(token, name, value):
            print(f"⚠️  Failed to add secret {name}, but you can add it manually")

    # Done
    print("\n" + "=" * 60)
    print("✅ GitHub Actions Setup Complete!")
    print("=" * 60)
    print("\nNow, every push to 'main' will automatically:")
    print("  1. Build the project")
    print("  2. Deploy to VPS")
    print("  3. Restart PM2 (zero downtime)")
    print("  4. Verify deployment")
    print("\nView deployments at:")
    print(f"  https://github.com/{REPO_OWNER}/{REPO_NAME}/actions")
    print("\nTo deploy now, run:")
    print("  git push origin main")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
