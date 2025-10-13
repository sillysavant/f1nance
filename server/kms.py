import os
import base64
from typing import Optional

import boto3

KMS_KEY_ID = os.getenv("KMS_KEY_ID")
AWS_REGION = os.getenv("AWS_REGION", "us-east-2")

_kms = boto3.client("kms", region_name=AWS_REGION)


def encrypt_text(plaintext: str) -> str:
    if not KMS_KEY_ID:
        raise RuntimeError("KMS_KEY_ID not set in environment")
    resp = _kms.encrypt(KeyId=KMS_KEY_ID, Plaintext=plaintext.encode("utf-8"))
    ct = resp["CiphertextBlob"]
    return base64.b64encode(ct).decode("utf-8")


def decrypt_text(b64_ciphertext: str) -> str:
    ct = base64.b64decode(b64_ciphertext)
    resp = _kms.decrypt(CiphertextBlob=ct)
    return resp["Plaintext"].decode("utf-8")
