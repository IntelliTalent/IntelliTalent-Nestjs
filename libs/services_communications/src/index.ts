export * from './services_communications.module';
export * from './services_communications.service';

// User Service

// pattern
export * from './userService/patterns/userService.pattern';

// dtos
export * from './userService/dtos/Create-User.dto';
export * from './userService/dtos/updateUser.dto';
export * from './userService/dtos/login.dto';
export * from './userService/dtos/user.dto';

export * from './cover-letter-generator-service/dtos/generate-cover-letter.dto'

// interfaces
export * from './userService/interfaces/findUser.interface';
export * from './userService/interfaces/populateUser.interface';
export * from './userService/interfaces/selectUser.interface';

export const HealthCheckPatterns = 'healthCheck';





export * from './authService/interfaces/user-request.interface'
export * from './authService/interfaces/user-jwt.interface'
