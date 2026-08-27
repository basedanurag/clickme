package com.clickme.util;

import java.security.SecureRandom;

public final class ShortCodeGenerator {

    private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private static final int SHORT_CODE_LENGTH = 7;

    private static final SecureRandom RANDOM = new SecureRandom();

    private ShortCodeGenerator() {
    }

    public static String generate() {

        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < SHORT_CODE_LENGTH; i++) {
            builder.append(
                    CHARACTERS.charAt(
                            RANDOM.nextInt(CHARACTERS.length())));
        }

        return builder.toString();
    }
}