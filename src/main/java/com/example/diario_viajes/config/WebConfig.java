package com.example.diario_viajes.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Permitir acceso a  la carpeta que tenemos llamada /Subidas  para almacenar las fotos
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/Subidas/**")
                .addResourceLocations("file:Subidas/");
    }
    // Habilitar CORS para el frontend
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:63342") // Cambia si usas otro puerto
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}


