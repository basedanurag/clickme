package com.clickme.service.impl;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.clickme.entity.Url;
import com.clickme.exception.ResourceNotFoundException;
import com.clickme.repository.UrlRepository;
import com.clickme.service.QrCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QrCodeServiceImpl implements QrCodeService {

    private final UrlRepository urlRepository;

    public QrCodeServiceImpl(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    @Override
    public byte[] generateQrCode(Long urlId) throws Exception {

        Url url = urlRepository.findById(urlId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("URL not found"));

        String shortUrl = "http://localhost:8080/" + url.getShortCode();

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
}