import {
  ConnectionManager,
  getConnectionManager,
  Connection,
  ConnectionOptions,
  createConnection,
} from 'typeorm';

import entities from './entity';
import 'pg'; // Crucial for postgres
import 'dotenv/config';

export default class Database {
  connectionManager: ConnectionManager;
  constructor() {
    this.connectionManager = getConnectionManager();
  }

  async connect() {
    console.log(process.env);
    const connectionOptions: ConnectionOptions = {
      entities,
      type: process.env.RDS_TYPE,
      host: process.env.RDS_HOSTNAME,
      database: process.env.RDS_DATABASE,
      username: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      port: parseInt(process.env.RDS_PORT || '5432', 10),
    };
    return createConnection(connectionOptions);
  }

  async getConnection(): Promise<Connection> {
    const CONNECTION_NAME = `default`;
    if (this.connectionManager.has(CONNECTION_NAME)) {
      const connection = this.connectionManager.get(CONNECTION_NAME);
      try {
        if (connection.isConnected) {
          await connection.close();
        }
      } catch {}
      return connection.connect();
    }

    return this.connect();
  }
}

export const connectDatabase = async () => {
  const connection = new Database();
  return await connection.getConnection();
};
