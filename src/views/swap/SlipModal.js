import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "rgb(39, 28, 99)",
  border: "none",
  borderRadius: "20px",
  boxShadow: 24,
  padding: "30px 20px",
};

const btnStyle = {
  bgcolor: "rgb(39, 28, 99)",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  color: "white",
  minWidth: "60px",
};

export default function BasicModal(props) {
  const { isOpen, setModal, setSlippage, slippage } = props;

  const handleChange = useCallback(
    (e) => {
      const RE = /^\d*\.?\d{0,18}$/;
      if (RE.test(e.currentTarget.value)) {
        setSlippage(e.currentTarget.value);
      }
    },
    [setSlippage]
  );

  return (
    <div>
      <Modal
        open={isOpen}
        onClose={() => {
          setModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h3" component="h2">
            Settings
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ margin: "20px 0", color: "#bcc3cf", fontSize: "16px" }}
          >
            Slippage tolerance
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{
              mt: 2,
              color: "#bcc3cf",
              fontSize: "15px",
              position: "relative",
            }}
          >
            <input
              style={{
                width: "100px",
                background: "transparent",
                border: "1px solid #fff",
                borderRadius: "10px",
                fontSize: "15px",
                padding: "10px",
                color: "white",
                paddingRight: "25px",
                "&:focus": {
                  borderColor: "white",
                },
              }}
            />
            <span
              style={{ position: "absolute", left: "80px", top: "8px" }}
              onChange={handleChange}
              value={slippage}
            >
              %
            </span>
            <Button sx={btnStyle} onClick={() => setSlippage("0.1")}>
              0.1%
            </Button>
            <Button sx={btnStyle} onClick={() => setSlippage("0.5")}>
              0.5%
            </Button>
            <Button sx={btnStyle} onClick={() => setSlippage("1")}>
              1.0%
            </Button>
            <Button sx={btnStyle} onClick={() => setSlippage("1")}>
              Auto
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
