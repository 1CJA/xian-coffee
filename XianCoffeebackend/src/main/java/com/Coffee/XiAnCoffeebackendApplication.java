package com.Coffee;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 栖岸咖啡后端启动类。
 */
@MapperScan("com.Coffee.mapper")
@SpringBootApplication
public class XiAnCoffeebackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(XiAnCoffeebackendApplication.class, args);
    }

}