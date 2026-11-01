CREATE DATABASE IF NOT EXISTS xian_coffee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xian_coffee;
SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE `address` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `member_id` bigint NOT NULL COMMENT '会员ID',
  `receiver_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收货人',
  `receiver_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收货手机号',
  `province` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省份',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '城市',
  `district` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '区县',
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细地址',
  `is_default` tinyint DEFAULT '0' COMMENT '是否默认：1是 0否',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_address_member` (`member_id`),
  CONSTRAINT `fk_address_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员地址表';

CREATE TABLE `admin_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录账号',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录密码',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员昵称',
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像路径',
  `role` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'ADMIN' COMMENT '角色',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

CREATE TABLE `banner` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  `title` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片相对路径',
  `link_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'NONE' COMMENT '跳转类型：NONE PRODUCT STORE COUPON PAGE',
  `link_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '跳转值',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1展示 0隐藏',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小程序轮播图表';

CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0停用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

CREATE TABLE `coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '优惠券ID',
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '优惠券名称',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型：FULL_REDUCTION满减 FREE_DRINK饮品免单 DISCOUNT折扣',
  `amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠金额',
  `min_amount` decimal(10,2) DEFAULT '0.00' COMMENT '使用门槛',
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '券面图片相对路径',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '到期日期',
  `total_count` int DEFAULT '0' COMMENT '发放总量',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0停用',
  `rule_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '使用规则',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

CREATE TABLE `member` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '会员ID',
  `openid` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信openid',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会员昵称',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小程序登录密码',
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像路径',
  `level_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '普通会员' COMMENT '会员等级',
  `points` int DEFAULT '0' COMMENT '当前积分',
  `balance` decimal(10,2) DEFAULT '0.00' COMMENT '会员余额',
  `stamp_count` int DEFAULT '0' COMMENT '当前集点数',
  `stamp_exchange_count` int DEFAULT '0' COMMENT '集点兑换次数',
  `status` tinyint DEFAULT '1' COMMENT '状态：1正常 0禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

CREATE TABLE `member_coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '会员优惠券ID',
  `member_id` bigint NOT NULL COMMENT '会员ID',
  `coupon_id` bigint NOT NULL COMMENT '优惠券ID',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'UNUSED' COMMENT '状态：UNUSED未使用 USED已使用 EXPIRED已过期',
  `received_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `order_id` bigint DEFAULT NULL COMMENT '使用订单ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_member_coupon_coupon` (`coupon_id`),
  KEY `idx_member_coupon_member` (`member_id`),
  CONSTRAINT `fk_member_coupon_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`),
  CONSTRAINT `fk_member_coupon_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员优惠券表';

CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单明细ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `product_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '下单时商品名称',
  `product_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '下单时商品图片',
  `unit_price` decimal(10,2) NOT NULL COMMENT '单价',
  `quantity` int NOT NULL COMMENT '数量',
  `spec_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '规格文本',
  `item_amount` decimal(10,2) NOT NULL COMMENT '小计金额',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_order_item_order` (`order_id`),
  KEY `fk_order_item_product` (`product_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `member_id` bigint NOT NULL COMMENT '会员ID',
  `store_id` bigint DEFAULT NULL COMMENT '门店ID',
  `address_id` bigint DEFAULT NULL COMMENT '地址ID',
  `order_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PICKUP' COMMENT '订单类型：PICKUP自取 DINE_IN堂食 DELIVERY外送',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING_PAYMENT' COMMENT '订单状态',
  `total_amount` decimal(10,2) NOT NULL COMMENT '商品总金额',
  `coupon_amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠券抵扣金额',
  `points_amount` decimal(10,2) DEFAULT '0.00' COMMENT '积分抵扣金额',
  `pay_amount` decimal(10,2) NOT NULL COMMENT '实付金额',
  `use_points` int DEFAULT '0' COMMENT '使用积分数',
  `member_coupon_id` bigint DEFAULT NULL COMMENT '使用的会员优惠券ID',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '订单备注',
  `pickup_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '取餐码',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `cancel_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '取消原因',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `fk_orders_store` (`store_id`),
  KEY `fk_orders_address` (`address_id`),
  KEY `fk_orders_member_coupon` (`member_coupon_id`),
  KEY `idx_order_member` (`member_id`),
  KEY `idx_order_status` (`status`),
  CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  CONSTRAINT `fk_orders_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  CONSTRAINT `fk_orders_member_coupon` FOREIGN KEY (`member_coupon_id`) REFERENCES `member_coupon` (`id`),
  CONSTRAINT `fk_orders_store` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

CREATE TABLE `points_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '积分记录ID',
  `member_id` bigint NOT NULL COMMENT '会员ID',
  `order_id` bigint DEFAULT NULL COMMENT '订单ID',
  `change_points` int NOT NULL COMMENT '积分变动值，正数增加，负数扣减',
  `record_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型：ORDER_GAIN订单获得 ORDER_DEDUCT订单抵扣 REFUND_RETURN退款返还 ADMIN_ADJUST后台调整',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_points_order` (`order_id`),
  KEY `idx_points_member` (`member_id`),
  CONSTRAINT `fk_points_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  CONSTRAINT `fk_points_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `short_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品简称',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品描述',
  `detail_description` text COLLATE utf8mb4_unicode_ci COMMENT '详情介绍',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '列表图片相对路径',
  `detail_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '详情图片相对路径',
  `sales_count` int DEFAULT '0' COMMENT '销量',
  `stock` int DEFAULT '999' COMMENT '库存',
  `status` tinyint DEFAULT '1' COMMENT '状态：1上架 0下架',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_status` (`status`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

CREATE TABLE `product_spec_option` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `spec_option_id` bigint NOT NULL COMMENT '规格选项ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_pso_product` (`product_id`),
  KEY `fk_pso_option` (`spec_option_id`),
  CONSTRAINT `fk_pso_option` FOREIGN KEY (`spec_option_id`) REFERENCES `spec_option` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pso_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格关联表';

CREATE TABLE `spec_group` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '规格组ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规格组名称',
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规格组编码',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0停用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格组表';

CREATE TABLE `spec_option` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '规格选项ID',
  `group_id` bigint NOT NULL COMMENT '规格组ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项名称',
  `price_delta` decimal(10,2) DEFAULT '0.00' COMMENT '加价金额',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0停用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_spec_option_group` (`group_id`),
  CONSTRAINT `fk_spec_option_group` FOREIGN KEY (`group_id`) REFERENCES `spec_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格选项表';

CREATE TABLE `stamp_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '集点记录ID',
  `member_id` bigint NOT NULL COMMENT '会员ID',
  `order_id` bigint DEFAULT NULL COMMENT '订单ID',
  `change_count` int NOT NULL COMMENT '集点变动值，正数增加，负数清零/扣减',
  `record_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型：ORDER_GAIN订单获得 EXCHANGE_REWARD兑换奖励 ADMIN_ADJUST后台调整',
  `exchange_coupon_id` bigint DEFAULT NULL COMMENT '兑换产生的优惠券ID',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_stamp_order` (`order_id`),
  KEY `fk_stamp_coupon` (`exchange_coupon_id`),
  KEY `idx_stamp_member` (`member_id`),
  CONSTRAINT `fk_stamp_coupon` FOREIGN KEY (`exchange_coupon_id`) REFERENCES `coupon` (`id`),
  CONSTRAINT `fk_stamp_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  CONSTRAINT `fk_stamp_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集点记录表';

CREATE TABLE `stamp_rule` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '集点规则ID',
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `target_count` int DEFAULT '10' COMMENT '满多少点可兑换',
  `reward_coupon_id` bigint DEFAULT NULL COMMENT '奖励优惠券ID',
  `valid_days` int DEFAULT '5' COMMENT '兑换券有效天数',
  `status` tinyint DEFAULT '1' COMMENT '状态：1启用 0停用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `fk_stamp_rule_coupon` (`reward_coupon_id`),
  CONSTRAINT `fk_stamp_rule_coupon` FOREIGN KEY (`reward_coupon_id`) REFERENCES `coupon` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集点规则表';

CREATE TABLE `store` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '门店ID',
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '门店名称',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '门店地址',
  `business_hours` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '营业时间',
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '门店图片相对路径',
  `video_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '门店视频相对路径',
  `status` tinyint DEFAULT '1' COMMENT '状态：1营业 0停业',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='门店表';
SET FOREIGN_KEY_CHECKS=1;
