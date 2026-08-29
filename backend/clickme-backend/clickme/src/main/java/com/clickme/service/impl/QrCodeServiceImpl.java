package com.clickme.service.impl;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.clickme.entity.Url;
import com.clickme.entity.User;
import com.clickme.exception.ResourceNotFoundException;
import com.clickme.repository.UrlRepository;
import com.clickme.security.CustomUserDetails;
import com.clickme.service.QrCodeService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QrCodeServiceImpl implements QrCodeService {

    private final UrlRepository urlRepository;

    @org.springframework.beans.factory.annotation.Value("${app.base-url}")
    private String baseUrl;

    public QrCodeServiceImpl(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    @Override
    public byte[] generateQrCode(Long urlId) throws Exception {

        Url url = urlRepository.findByIdAndUser(urlId, getCurrentUser())
                .orElseThrow(() ->
                        new ResourceNotFoundException("URL not found"));

        String shortUrl = baseUrl + "/" + url.getShortCode();

        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        BitMatrix bitMatrix = qrCodeWriter.encode(
                shortUrl,
                BarcodeFormat.QR_CODE,
                300,
                300
        );

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        MatrixToImageWriter.writeToStream(
                bitMatrix,
                "PNG",
                outputStream
        );

        return outputStream.toByteArray();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}