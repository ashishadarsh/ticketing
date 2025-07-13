import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';
import { json } from 'express';

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');
process.env.STRIPE_KEY = 'sk_test_51RjdOAR8IQhpv1s7GSTzxOz4HsfE9Rc8xyJweohRvmekgmo5YW0X9zYRgoXfAmF3BZTgTcuM1Rak0VQhk22405Gu00ePisEDJr';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
   
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
});

afterAll(async () => {
    if (mongo) {
      await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signin = (id?: string) => {

  // Build a JWT payload { email id iat }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object { jwt: MY_JWT }
  const session = {jwt: token};

  // Turn that session into json
  const sessionJSON = JSON.stringify(session);

  // Take json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return the string that's the cookie with the encoded data
  return [`session=${base64}`];
}