package com.clickme.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.clickme.dto.cache.UrlCacheDto;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, UrlCacheDto> redisTemplate(
            RedisConnectionFactory connectionFactory) {

        // Build an ObjectMapper with JavaTimeModule so that LocalDateTime
        // fields (e.g. UrlCacheDto.expiresAt) serialize/deserialize correctly.
        ObjectMapper redisObjectMapper = new ObjectMapper();
        redisObjectMapper.registerModule(new JavaTimeModule());
        redisObjectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        RedisTemplate<String, UrlCacheDto> template = new RedisTemplate<>();

        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(new StringRedisSerializer());

        template.setValueSerializer(
                new GenericJackson2JsonRedisSerializer(redisObjectMapper));

        template.setHashKeySerializer(new StringRedisSerializer());

        template.setHashValueSerializer(
                new GenericJackson2JsonRedisSerializer(redisObjectMapper));

        template.afterPropertiesSet();

        return template;
    }
}