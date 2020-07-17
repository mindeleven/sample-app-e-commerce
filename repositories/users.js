const fs = require('fs');
const crypto = require('crypto');

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
    const records = await this.getAll();
    records.push(attrs);
    await this.writeAll(records);
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
}

const test = async () => {
  const repo = new UsersRepository('users.json');
  let date = new Date(); let timestamp = date. getTime();
  /***
  await repo.create({
    'email': `test_${timestamp}@test.com`
    // 'password': `password${timestamp}`
  });
  ***/
  //const users = await repo.getAll();
  await repo.update('45dd8b98', { 'password': `password${timestamp}` });
  //const user = await repo.getOne('53a45fca');
  // await repo.delete('53a45fca');
  //console.log(users);
  //console.log(user);
}

test();
