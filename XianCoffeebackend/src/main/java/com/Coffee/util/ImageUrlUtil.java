package com.Coffee.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 图片访问地址拼接工具。
 */
@Component
public class ImageUrlUtil {

    /** 图片访问前缀。 */
    @Value("${xian-coffee.upload.image-url-prefix:/images/}")
    private String imageUrlPrefix;

    /**
     * 将数据库图片路径拼成可访问URL。
     *
     * @param imagePath 数据库图片路径
     * @return 完整图片URL
     */
    public String buildUrl(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return imagePath;
        }
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }
        String prefix = imageUrlPrefix;
        if (!prefix.startsWith("/")) {
            prefix = "/" + prefix;
        }
        if (!prefix.endsWith("/")) {
            prefix = prefix + "/";
        }
        String cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(prefix)
                .path(cleanPath)
                .toUriString();
    }
}