import { Body, Post, Route, Tags } from "tsoa";
import { AuthService, LoginCredentials } from "./auth.service";

const authService = new AuthService();

@Route("auth")
@Tags("Authentication Routes")
export default class AuthController {
  /**
   * @summary User login
   */
  @Post("/login")
  async login(@Body() credentials: LoginCredentials) {
    return authService.login(credentials);
  }

  /**
   * @summary Refresh access token
   */
  @Post("/refresh")
  async refresh(@Body() body: { refreshToken: string }) {
    return authService.refreshToken(body.refreshToken);
  }

  /**
   * @summary User logout
   */
  @Post("/logout")
  async logout() {
    // Logout is handled client-side for JWT
    return { message: "Logout successful" };
  }

  /**
   * @summary User generate API key
   */
  @Post("/keygenerate")
  async generateApiKey() {
    // Implementation for generating API key
    return { message: "API key generated successfully" };
  }
}
