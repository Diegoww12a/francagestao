import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('francagestao', 10);
console.log(hash);
