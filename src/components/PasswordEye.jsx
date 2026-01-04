import { LuEye, LuEyeOff } from "react-icons/lu";

export default function PasswordEye({ visible, onToggle }) {
  return (
    <span
      onClick={onToggle}
      role="button"
      aria-label={visible ? "Hide password" : "Show password"}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        color: "#6c757d",
        display: "flex",
        alignItems: "center"
      }}
    >
      {visible ?  <LuEye size={18} />: <LuEyeOff size={18} />}
    </span>
  );
}
