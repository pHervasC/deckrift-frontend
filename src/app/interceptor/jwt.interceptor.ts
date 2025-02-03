import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SessionService } from "../service/session.service";

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

    constructor(private oSessionService: SessionService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.oSessionService.isSessionActive()) {
            const token = this.oSessionService.getToken();
            // Clone the request and add the authorization header if the token exists
            if (token) {
                req = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        }
        // Pass the request to the next handler
        return next.handle(req);
    }
}
