const app = require('../src/app');
const request = require('supertest');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Alice',
      email: 'alice@dot.com',
      password: 'MyPass777!'
    })
    .expect(201);

  //Asset thar DB was change correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assertions about the response
  expect(response.body.user.name).toBe('Alice');
  expect(response.body).toMatchObject({
    user: {
        name: 'Alice',
        email: 'alice@dot.com',
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('MyPass777!');
})


test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should login non-existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'alice@dot.com',
      password: userOne.password
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('Should delete authenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

    const user = await User.findById(userOneId);
    
    expect(user).toBeNull();
});

test('Should not delete unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async() => {
    await request(app)
    .patch('/users/me/')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Ann'
    })
    .expect(200)
    const user = await User.findById(userOneId);
    expect(user.name).toBe('Ann');
})

test('Should not update invalid user fields', async() => {
    await request(app)
    .patch('/users/me/')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        address: 'Silicon Valley'
    })
    .expect(400)
})


// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
