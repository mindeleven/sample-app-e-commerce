const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repository requires a filename!')
    }
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async getAll() {
    return JSON.parse(await fs.promises.readFile(this.filename, {
      encoding: 'utf8'
    }));
  }

  async create(attrs) {
    attrs.id = this.randomID();

    const salt = crypto.randomBytes(8).toString('hex');
    const buf = await scrypt(attrs.password, salt, 64);

    const records = await this.getAll();

    const record = {
      ...attrs,
      password: `${buf.toString('hex')}.${salt}`
    };
    records.push(record);

    await this.writeAll(records);
    return record;
  }

  async comparePasswords(saved, supplied) {
    const [ hashed, salt ] = saved.split('.');
    const hashedSupplied = await scrypt(supplied, salt, 64);
    // hashedSupplied returns a buffer
    // so it needs to be converted to a string
    return hashed === hashedSupplied.toString('hex');
  }

  async writeAll(records) {
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
  }

  randomID() {
    return crypto.randomBytes(4).toString('hex');
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find(record => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter(record => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find(record => record.id === id);
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }

  }
}

module.exports = new UsersRepository('users.json');

/***
const test = async () => {
  const repo = new UsersRepository('users.json');
  let date = new Date(); let timestamp = date. getTime();
  await repo.create({
    'email': `test_${timestamp}@test.com`
    // 'password': `password${timestamp}`
  });
  //const users = await repo.getAll();
  //await repo.update('45dd8b98', { 'password': `password${timestamp}` });
  //const user = await repo.getOne('53a45fca');
  // await repo.delete('53a45fca');
  //console.log(users);
  //console.log(user);

  const user = await repo.getOneBy({
    email: "test_1594976744907@test.com",
    password: 'xxxmypasswordd'
  });
  console.log(user);

}

test();
***/
