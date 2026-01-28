import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { X, Shield, Copy, Check, Download } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 3px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: #0f0f1e;
  border-radius: 22px;
  padding: 40px;
  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transform: rotate(90deg);
  }
`;

const Step = styled.div`
  margin-bottom: 32px;
`;

const StepNumber = styled.div`
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const StepTitle = styled.h3`
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
`;

const StepDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px 0;
`;

const QRCodeContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 12px;
`;

const SecretKey = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  color: #667eea;
  word-break: break-all;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CopyButton = styled.button`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  font-size: 16px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  text-align: center;
  letter-spacing: 4px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: normal;
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  width: 100%;
  background: ${(props) =>
    props.variant === "secondary"
      ? "rgba(255, 255, 255, 0.05)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
  border: ${(props) =>
    props.variant === "secondary"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "none"};
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RecoveryCodesContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
`;

const RecoveryCodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const RecoveryCode = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  color: #667eea;
  text-align: center;
`;

const WarningBox = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #ffc107;
  font-size: 14px;
  line-height: 1.6;
  margin-top: 16px;
  display: flex;
  gap: 12px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
`;

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function TwoFactorSetupModal({
  isOpen,
  onClose,
  onComplete,
}: TwoFactorSetupModalProps) {
  const { setupTOTP, verifyAndEnableTOTP } = useAuthStore();

  const [step, setStep] = useState<"qr" | "verify" | "recovery">("qr");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadQRCode();
    }
  }, [isOpen]);

  const loadQRCode = async () => {
    try {
      setIsLoading(true);
      const data = await setupTOTP();
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const data = await verifyAndEnableTOTP(verificationCode);
      setRecoveryCodes(data.recoveryCodes);
      setStep("recovery");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yourdrive-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalContent>
          <Header>
            <Title>
              <Shield size={28} />
              Enable Two-Factor Authentication
            </Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          {step === "qr" && (
            <>
              <Step>
                <StepNumber>1</StepNumber>
                <StepTitle>Scan QR Code</StepTitle>
                <StepDescription>
                  Open your authenticator app (Google Authenticator, Authy,
                  etc.) and scan this QR code:
                </StepDescription>
                {isLoading ? (
                  <QRCodeContainer>Loading...</QRCodeContainer>
                ) : (
                  <QRCodeContainer>
                    <QRCodeImage src={qrCode} alt="2FA QR Code" />
                  </QRCodeContainer>
                )}
              </Step>

              <Step>
                <StepNumber>2</StepNumber>
                <StepTitle>Or Enter This Key Manually</StepTitle>
                <StepDescription>
                  If you can't scan the QR code, enter this key manually:
                </StepDescription>
                <SecretKey>
                  <span>{secret}</span>
                  <CopyButton onClick={handleCopySecret}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy"}
                  </CopyButton>
                </SecretKey>
              </Step>

              <Button onClick={() => setStep("verify")}>Continue</Button>
            </>
          )}

          {step === "verify" && (
            <>
              <Step>
                <StepNumber>3</StepNumber>
                <StepTitle>Verify Your Code</StepTitle>
                <StepDescription>
                  Enter the 6-digit code from your authenticator app to verify
                  the setup:
                </StepDescription>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ""))
                  }
                  autoFocus
                />
              </Step>

              <Button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep("qr")}
                style={{ marginTop: "12px" }}
              >
                Back
              </Button>
            </>
          )}

          {step === "recovery" && (
            <>
              <Step>
                <StepNumber>✓</StepNumber>
                <StepTitle>2FA Enabled Successfully!</StepTitle>
                <StepDescription>
                  Save these recovery codes in a secure place. You can use them
                  to access your account if you lose your device:
                </StepDescription>

                <RecoveryCodesContainer>
                  <RecoveryCodesGrid>
                    {recoveryCodes.map((code, index) => (
                      <RecoveryCode key={index}>{code}</RecoveryCode>
                    ))}
                  </RecoveryCodesGrid>
                  <Button
                    variant="secondary"
                    onClick={handleDownloadRecoveryCodes}
                  >
                    <Download size={18} style={{ marginRight: "8px" }} />
                    Download Recovery Codes
                  </Button>
                </RecoveryCodesContainer>

                <WarningBox>
                  <Shield size={20} />
                  <div>
                    <strong>Important:</strong> Store these codes safely. Each
                    code can only be used once. If you lose access to your
                    authenticator app, these are the only way to recover your
                    account.
                  </div>
                </WarningBox>
              </Step>

              <Button onClick={handleComplete} style={{ marginTop: "24px" }}>
                Done
              </Button>
            </>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
}
