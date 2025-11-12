package com.example.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity // Kích hoạt Spring Security cho ứng dụng Reactive (WebFlux)
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
        http
            // 1. Vô hiệu hóa CSRF cho API Gateway (thường là stateless)
            .csrf(ServerHttpSecurity.CsrfSpec::disable)

            // 2. Cấu hình Quy tắc Phân quyền (Authorization Rules)
            .authorizeExchange(exchanges -> exchanges
                // Cho phép truy cập công khai vào Eureka Dashboard và các endpoint public khác
                .pathMatchers("/eureka/**").permitAll()
                .pathMatchers("/api/auth/**").permitAll() // Ví dụ: endpoint đăng nhập/đăng ký

                // Yêu cầu token hợp lệ VÀ có quyền "ADMIN"
                .pathMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")

                // Yêu cầu token hợp lệ VÀ có quyền "USER" hoặc "ADMIN"
                .pathMatchers("/api/orders/**", "/api/users/**").hasAnyRole("ADMIN", "USER")

                // Bất kỳ request nào còn lại PHẢI có token và được xác thực
                .anyExchange().permitAll()
            )

            // 3. Kích hoạt OAuth2 Resource Server để xử lý JWT (Middleware Xác thực chính)
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> 
                // Tùy chỉnh cách Spring Security đọc các quyền (GrantedAuthorities) từ JWT
                // Keycloak thường lưu roles trong claim "realm_access.roles"
                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
            ));

        return http.build();
    }

    /**
     * Tùy chỉnh bộ chuyển đổi JWT để trích xuất quyền (GrantedAuthorities/Roles) từ
     * các claim trong JWT. Mặc định, Spring Security tìm kiếm claim "scope" hoặc
     * "scp". Với Keycloak, roles thường nằm trong claim "realm_access.roles".
     */
    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            if (jwt.hasClaim("realm_access")) {
                Object realmAccessClaim = jwt.getClaim("realm_access");
                if (realmAccessClaim instanceof java.util.Map) {
                    java.util.Map<String, Object> realmAccess = (java.util.Map<String, Object>) realmAccessClaim;
                    if (realmAccess.containsKey("roles") && realmAccess.get("roles") instanceof Collection) {
                        @SuppressWarnings("unchecked") // Bỏ qua cảnh báo kiểu dữ liệu
                        Collection<String> roles = (Collection<String>) realmAccess.get("roles");
                        
                        // Thêm tiền tố "ROLE_" cho mỗi vai trò (tiêu chuẩn của Spring Security)
                        // Bọc trong Flux.fromIterable để phù hợp với môi trường Reactive
                        return Flux.fromIterable(
                            roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                                .collect(Collectors.toList())
                        );
                    }
                }
            }
            return Flux.empty(); // Trả về danh sách rỗng nếu không tìm thấy roles
        });
        return converter;
    }
}