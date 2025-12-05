import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // clear storage/cookies
    try { localStorage.clear(); } catch {}
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login, store refreshToken and fetch current user', (done) => {
    const creds = { email: 'test@example.com', password: 'password' };

    const loginResp = {
      success: true,
      message: 'ok',
      data: {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date().toISOString(),
        user: {
          id: 1,
          email: 'test@example.com',
          password: null,
          firstName: 'Test',
          lastName: 'User',
          role: 'User'
        }
      },
      errors: null,
      timestamp: new Date().toISOString()
    };

    const meResp = {
      success: true,
      message: 'ok',
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    service.login(creds, true).subscribe((resp) => {
      expect(resp).toBeTruthy();
    });

    const reqLogin = httpMock.expectOne(`${environment.apiUrl}/Auth/Login`);
    expect(reqLogin.request.method).toBe('POST');
    reqLogin.flush(loginResp);

    const reqMe = httpMock.expectOne(`${environment.apiUrl}/Auth/Me`);
    expect(reqMe.request.method).toBe('GET');
    reqMe.flush(meResp);

    // allow microtasks
    setTimeout(() => {
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
      const current = service.getCurrentUserValue();
      expect(current).toBeTruthy();
      expect(current?.email).toBe('test@example.com');
      done();
    }, 0);
  });
});
