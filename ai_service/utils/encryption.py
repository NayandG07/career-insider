import os
import binascii
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding

def decrypt_api_key(encrypted_hex: str) -> str:
    """
    Decrypts an API key that was encrypted with Node.js crypto AES-256-CBC.
    The IV is prepended to the ciphertext and the whole thing is hex encoded.
    """
    secret = os.getenv("ENCRYPTION_SECRET", "").encode('utf-8')
    if len(secret) != 32:
        raise ValueError("ENCRYPTION_SECRET must be exactly 32 bytes long")

    try:
        # Convert hex to bytes
        encrypted_data = binascii.unhexlify(encrypted_hex)
        
        # Extract IV (first 16 bytes) and ciphertext
        iv = encrypted_data[:16]
        ciphertext = encrypted_data[16:]
        
        # Create cipher
        cipher = Cipher(algorithms.AES(secret), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        
        # Decrypt
        padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        
        # Unpad (PKCS7)
        unpadder = padding.PKCS7(128).unpadder()
        plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
        
        return plaintext.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Failed to decrypt API key: {str(e)}")
