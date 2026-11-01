package com.Coffee.controller;

import com.Coffee.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 图片上传接口。
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    /**
     * 图片保存目录。
     */
    @Value("${xian-coffee.upload.image-path}")
    private String imagePath;

    /**
     * 图片访问前缀。
     */
    @Value("${xian-coffee.upload.image-url-prefix}")
    private String imageUrlPrefix;

    /**
     * 上传图片文件。
     *
     * @param file 前端上传的图片
     * @return 图片文件名和访问地址
     */
    @PostMapping("/image")
    public Result uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("请选择要上传的图片");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        if (!isImageExtension(extension)) {
            return Result.error("只支持上传图片文件");
        }

        String filename = UUID.randomUUID() + extension;
        Path uploadDir = Paths.get(imagePath);
        Path targetPath = uploadDir.resolve(filename);

        try {
            Files.createDirectories(uploadDir);
            file.transferTo(targetPath.toFile());
        } catch (IOException e) {
            return Result.error("图片上传失败");
        }

        String imageUrl = imageUrlPrefix + filename;
        Map<String, Object> data = new HashMap<>();
        data.put("filename", filename);
        data.put("url", imageUrl);
        return Result.success(data);
    }

    /**
     * 获取文件扩展名。
     *
     * @param filename 原始文件名
     * @return 扩展名
     */
    private String getExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int dotIndex = filename.lastIndexOf(".");
        if (dotIndex < 0) {
            return "";
        }
        return filename.substring(dotIndex).toLowerCase();
    }

    /**
     * 判断是否图片格式。
     *
     * @param extension 文件扩展名
     * @return 是否图片
     */
    private boolean isImageExtension(String extension) {
        return ".jpg".equals(extension)
                || ".jpeg".equals(extension)
                || ".png".equals(extension)
                || ".gif".equals(extension)
                || ".webp".equals(extension);
    }
}
