package com.clickme.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clickme.service.QrCodeService;

@RestController
@RequestMapping("/api/qr")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping("/{urlId}")
    public ResponseEntity<byte[]> getQrCode(
            @PathVariable Long urlId) throws Exception {

        byte[] qr = qrCodeService.generateQrCode(urlId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=qrcode.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(qr);
    }
}