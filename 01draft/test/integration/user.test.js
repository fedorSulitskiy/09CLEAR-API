const request = require('supertest');
const generateWebToken = require('../../auth/generateToken');
const tud = require('./_testUserDetails');

let user_id;
let token;

let first_name;
let last_name;
let email; 
let password;
let hash;
let mobile;
let user_type_id;
let position;
let company;
let user_image;
let status;

let trial_user_object;

describe('User API', () => {

    beforeEach(() => {
        server = require('../../index');

        first_name = tud.first_name;
        last_name = tud.last_name;
        email = tud.email; 
        password = tud.password;
        hash = tud.hash;
        mobile = tud.mobile;
        user_type_id = tud.user_type_id;
        position = tud.position;
        company = tud.company;
        user_image = tud.user_image;
        status = tud.status;

        token = generateWebToken({ 
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password,
            hash: hash,
            mobile: mobile,
            user_type_id: user_type_id,
            position: position,
            company: company,
            user_image: user_image,
            status: status,
        });
    });
    afterEach(async() => {
        trial_user_object = await request(server)
            .get("/api/users/" + email);
        user_id = trial_user_object.body.user_id;

        await request(server)
            .delete("/api/users/" + user_id)
            .set("Authorization", "Bearer "+token);

        await request(server)
            .delete("/api/users/testing/" +user_id)
            .set("Authorization", "Bearer "+token);
        
        server.close();
    });

    const execCreateUser = () => {
        return request(server)
            .post("/api/users/")
            .set("Authorization", "Bearer "+token)
            .send({ 
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                hash: hash,
                mobile: mobile,
                user_type_id: user_type_id,
                position: position,
                company: company,
                user_image: user_image,
                status: status,
            });
    };
    const execUpdateUser = () => {
        return request(server)
            .patch("/api/users/" + user_id)
            .set("Authorization", "Bearer "+token)
            .send({ 
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                hash: hash,
                mobile: mobile,
                user_type_id: user_type_id,
                position: position,
                company: company,
                user_image: user_image,
                status: status,
            });
    };
    const execShowUserByID = () => {
        return request(server)
            .get("/api/users/" + user_id);
    };
    const execShowUserByEmail = () => {
        return request(server)
            .get("/api/users/" + email);
    };
    const execDeleteUser = () => {
        return request(server)
            .delete("/api/users/" + user_id)
            .set("Authorization", "Bearer "+token);
    };
    const execLogin = () => {
        return request(server)
            .post("/api/users/login/")
            .send({ email: email, password: password});
    };
    const execLogout = () => {
        return request(server)
            .post("/api/users/logout/" + user_id)
            .set("Authorization", "Bearer "+token);
    };

    /// VALID REQUESTS

    describe('create function', () => {
        it('Should return 200 if valid createUser request', async () => {
            const res = await execCreateUser();
            
            expect(res.status).toBe(200);
        });
        it("Should return 400 if user is already in the database", async () => {
            await execCreateUser();
    
            const res = await execCreateUser();
            
            expect(res.status).toBe(400);
        });
        it('should return 400 if token is invalid on createUser', async () => {
            token = '';

            const res = await execCreateUser();
    
            expect(res.status).toBe(400);
        });
        it('should return 401 if user is not logged in on createUser', async () => {

            const res = await request(server)
                .post("/api/users/")
                .send({ first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    hash: hash,
                    mobile: mobile,
                    user_type_id: user_type_id,
                    position: position,
                    company: company,
                    user_image: user_image,
                    status: status,
                });
    
            expect(res.status).toBe(401);
        });
        it('Should return 500 if server throws internal error on createUser', async () => {

            const res = await request(server)
                .post("/api/users/")
                .set("Authorization", "Bearer "+token)
                .send({ email: 'trial@email.com', password: '1111' });

            expect(res.status).toBe(500);              
        });
    });

    describe('update function', () => {
        it('Should return 200 if update is successful', async () => {
            await execCreateUser();
            first_name = 'TEST';
            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.user_id;
    
            const res = await execUpdateUser();
    
            expect(res.status).toBe(200);
        });
        it('Should return 200 if no content changed', async () => {
            await execCreateUser();

            trial_user_object = await request(server)
                .get("/api/users/" + email);
                user_id = trial_user_object.body.user_id;

            const res = await execUpdateUser();

            expect(res.status).toBe(200);
        });
        it('should return 400 if token is invalid in on updateUser', async () => {
            await execCreateUser();
            first_name = 'TEST';
            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.user_id;

            token = '';

            const res = await execUpdateUser();
    
            expect(res.status).toBe(400);
        });
        it('should return 401 if user is not logged in on updateUser', async () => {
            await execCreateUser();
            first_name = 'TEST';
            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.id;

            const res = await request(server)
                .patch("/api/users/" + user_id)
                .send({ 
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    hash: hash,
                    mobile: mobile,
                    user_type_id: user_type_id,
                    position: position,
                    company: company,
                    user_image: user_image,
                    status: status,
                });
    
            expect(res.status).toBe(401);
        });
        it('Should return 404 if user not found by updateUser', async () => {
            user_id = '10000000000';
            first_name = 'Test';

            const res = await execUpdateUser();

            expect(res.status).toBe(404);
        });
    });

    describe('showAll function', () => {
        it('Should return 200 if valid showAllUsers request', async () => {
            user_id = '';
    
            const res = await execShowUserByID();
            
            expect(res.status).toBe(200);
        });
    });

    describe('showUserByID function', () => {
        it('Should return 200 if valid showUserByID request', async () => {
            await execCreateUser();

            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.user_id;
    
            const res = await execShowUserByID();
            
            expect(res.status).toBe(200);
        });
        it('Should return 404 if user not found by showUserByID', async () => {
            user_id = '10000000000';

            const res = await execShowUserByID();
    
            expect(res.status).toBe(404);
        });  
    });

    describe('showUserByEmail function', () => {
        it('Should return 200 if valid showUserByEmail request', async () => {
            await execCreateUser();
    
            const res = await execShowUserByEmail();
            
            expect(res.status).toBe(200);
        });
        it('Should return 404 if user not found by showUserByEmail', async () => {
            email = 'THIS_EMAIL@dont.exist';

            const res = await execShowUserByEmail();
    
            expect(res.status).toBe(404);
        }); 
    });

    describe('deleteUser function', () => {
        it('Should return 200 if deleteUser is successful', async () => {
            await execCreateUser();

            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.user_id;
    
            const res = await execDeleteUser();
    
            expect(res.status).toBe(200);
        });
        it('should return 400 if token is invalid in on deleteUser', async () => {
            await execCreateUser();

            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.user_id;

            token = '';
    
            const res = await execDeleteUser();
    
            expect(res.status).toBe(400);
        });
        it('should return 401 if user is not logged in on deleteUser', async () => {
            await execCreateUser();

            trial_user_object = await request(server)
                .get("/api/users/" + email);
            user_id = trial_user_object.body.user_id;
    
            const res = await request(server)
                .delete("/api/users/" + user_id);
    
            expect(res.status).toBe(401);
        });    
        it('Should return 404 if user not found by deleteUser', async () => {
            user_id = '10000000000';

            const res = await execDeleteUser();
    
            expect(res.status).toBe(404);
        });
    });

    describe('login function', () => {
        it('Should return 200 if login successful', async () => {
            await execCreateUser();

            const res = await execLogin();
            
            expect(res.status).toBe(200);
        });
        it('Should return 404 if incorrect login details are provided', async () => {
            await execCreateUser();

            password = '';

            const res = await execLogin();
            
            expect(res.status).toBe(404);
        });
        it('Should return 404 if no login details are provided', async () => {
            await execCreateUser();

            email = '';
            password = '';

            const res = await execLogin();
            
            expect(res.status).toBe(404);
        });
    });

    describe('logout function', () => {
        it('Should return 200 if logout successful', async () => {
            const res = await execLogout();
            
            expect(res.status).toBe(200);
        });
    }); 
});