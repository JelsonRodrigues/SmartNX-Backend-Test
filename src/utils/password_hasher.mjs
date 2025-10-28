import bcrypt from 'bcrypt';

export default function calculate_hash_for_plaintext_password(plain_text_password, rounds = 10) {
  const salt = bcrypt.genSaltSync(rounds);
  const hashed_password = bcrypt.hashSync(plain_text_password, salt);
  return hashed_password;
};
