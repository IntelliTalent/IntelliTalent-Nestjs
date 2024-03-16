### Auth

**Framework: NestJS**
**Databases:**
- None

**Functionalities:**
- Handle user authentication and authorization.
- Signup, login, forget password, reset password.



- signup
    - when signup is successful, send a verification email to the user
    - when signup is successful, send a welcome email to the user
    - when signup with already existing email, return an error message
- login
    - when login is successful, return a token
    - when user create his account and not verified yet, return an error message
    - when user enter wrong email or password, return an error message
- forget password
    - when user enter his email, send a reset password email to the user
    - when user enter wrong email, return an error message
    - when user enter email with non-verified account, return an error message
- reset password
    - when user enter a new password, update the user password


- have guard for check the user is authenticated or not
- have guard for check the user is have the required type
- any public routes that decorator with `@Public()` will not check the user is authenticated or not
- any routes that decorator with `@Roles('admin')` will check the user is have the required type or not and include it will be authenticated
- any routes that isent decorator with `@Roles('admin')` will check the user is authenticated or not only withot check the user type

