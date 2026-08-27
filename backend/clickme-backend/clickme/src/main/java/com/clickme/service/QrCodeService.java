package com.clickme.service;

public interface QrCodeService {

    byte[] generateQrCode(Long urlId) throws Exception;

}