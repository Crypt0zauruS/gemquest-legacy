import { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip-rc";
import { useRouter } from "next/router";
import { useTheme } from "../../lib/ThemeContext";

const Logout = ({ logout }) => {
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const { setTheme, setDifficulty } = useTheme();

  useEffect(() => {
    if (checked) {
      const performLogout = async () => {
        setTheme(null);
        setDifficulty("easy");
        await logout();
        router.push("/");
      };
      performLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  return (
    <div className="logoutContainer">
      <h1
        className="logoutText"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        <p> Logout </p>
      </h1>
      {/* <label className="switch">
        <input onChange={handleChange} type="checkbox" checked={checked} />
        <span className="slider round" data-tip={`Reset the quiz`}></span>
      </label> */}
      <ReactTooltip place="left" effect="solid" />
    </div>
  );
};

export default Logout;
