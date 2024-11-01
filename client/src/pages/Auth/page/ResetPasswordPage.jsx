import { Toaster } from "sonner";
import ResetPasswordComponent from "../components/ResetPasswordComponent";

export default function ResetPasswordPage() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Left side - Reset Password form */}
        <div style={{ width: "100%" }} className="left-side">
          <ResetPasswordComponent />
        </div>

        {/* Right side - Image and overlay */}
        <div
          style={{
            position: "relative",
            width: "50%",
            display: "none",
          }}
          className="right-side"
        >
          <img
            src="https://res.cloudinary.com/dug5qzlcy/image/upload/v1730314420/x1ohtt8pmskzsriwh1lm.jpg"
            alt="Farm Background"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />

          {/* Overlay with content */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "600px" }}>
              <h2
                style={{
                  color: "white",
                  fontSize: "2.8rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Quản lý trang trại thông minh
              </h2>
              <p
                style={{
                  color: "white",
                  fontSize: "1.2rem",
                  opacity: 0.9,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                Giải pháp quản lý toàn diện cho trang trại của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .right-side {
            display: block !important;
          }
          .left-side {
            width: 50% !important;
          }
        }
      `}</style>
    </>
  );
}
