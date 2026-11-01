package com.Coffee.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web资源与跨域配置。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 图片上传保存目录。
     */
    @Value("${xian-coffee.upload.image-path}")
    private String imagePath;

    /**
     * 配置静态图片访问。
     *
     * @param registry 资源映射注册器
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + imagePath.replace("\\", "/") + "/";
        registry.addResourceHandler("/images/**").addResourceLocations(location);
    }

    /**
     * 配置前端联调跨域。
     *
     * @param registry 跨域注册器
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
