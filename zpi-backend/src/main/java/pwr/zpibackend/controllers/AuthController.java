package pwr.zpibackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import pwr.zpibackend.services.AuthService;

@RestController
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Get logged user details", description = "Returns logged user details based on email")
    @GetMapping("/user/{email}/details")
    public ResponseEntity<Object> getUserDetails(@PathVariable String email) {
        return ResponseEntity.ok(authService.getUserDetails(email));
    }

}
