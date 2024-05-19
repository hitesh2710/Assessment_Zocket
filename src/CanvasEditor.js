import React, { Component } from "react";
import { CompactPicker } from "react-color";

class CanvasEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      caption: "1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs",
      cta: "Shop Now",
      backgroundColor: "#0369A1",
      imageData: null,
      showColorPicker: false,
      recentColors: ["red", "yellow","blue","cyan","green"],
      template: null,
    };
    this.canvasRef = React.createRef();
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    fetch("/template.json")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ template: data });
        this.initializeCanvas();
      })
      .catch((error) => console.error("Error fetching template data:", error));
  }

  componentDidUpdate() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBackground(ctx);
    this.drawTemplate(ctx);
    this.drawCaption(ctx);
    this.drawCTA(ctx);
    if (this.state.imageData) {
      this.drawImage(ctx);
    }
  }

  initializeCanvas() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
    this.drawBackground(ctx);
    this.drawTemplate(ctx);
    this.drawCaption(ctx);
    this.drawCTA(ctx);
  }

  drawBackground(ctx) {
    ctx.fillStyle = this.state.backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  drawTemplate(ctx) {
    if (this.state.template) {
      const { urls } = this.state.template;
      const { mask, stroke, design_pattern } = urls;

      this.loadAndDrawImage(mask, ctx);
      this.loadAndDrawImage(stroke, ctx);
      this.loadAndDrawImage(design_pattern, ctx);
    }
  }

  loadAndDrawImage(url, ctx) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }

  drawCaption(ctx) {
    if (this.state.template) {
      const { caption } = this.state.template;
      ctx.font = `${caption.font_size}px Arial`;
      ctx.fillStyle = caption.text_color;
      ctx.textAlign = caption.alignment;
      const lines = this.wrapText(
        this.state.caption,
        caption.max_characters_per_line
      );
      let y = caption.position.y;
      for (const line of lines) {
        ctx.fillText(line, caption.position.x, y);
        y += caption.font_size;
      }
    }
  }

  drawCTA(ctx) {
    if (this.state.template) {
      const { cta } = this.state.template;
      ctx.font = `${cta.font_size || 30}px Arial`;
      ctx.fillStyle = cta.text_color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = this.wrapText(this.state.cta, cta.wrap_length || 20);
      let y = cta.position.y;
      const lineHeight = ctx.measureText("M").width * 1.2;
      for (const line of lines) {
        const width = ctx.measureText(line).width;
        const x = cta.position.x - width / 2;
        ctx.fillStyle = cta.background_color;
        this.roundRect(
          ctx,
          x - 10,
          y - lineHeight / 2,
          width + 20,
          lineHeight,
          10
        );
        ctx.fill();
        ctx.fillStyle = cta.text_color;
        ctx.fillText(line, cta.position.x, y);
        y += lineHeight;
      }
    }
  }

  drawImage(ctx) {
    const img = new Image();
    img.src = URL.createObjectURL(this.state.imageData);
    img.onload = () => {
      ctx.globalCompositeOperation = "source-over";
      if (this.state.template) {
        const { image_mask } = this.state.template;
        ctx.drawImage(
          img,
          image_mask.x,
          image_mask.y,
          image_mask.width,
          image_mask.height
        );
      }
    };
  }

  wrapText(text, maxLength) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const newLine = currentLine + " " + word;

      if (newLine.length > maxLength) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = newLine;
      }
    }
    lines.push(currentLine);

    return lines;
  }

  handleCaptionChange = (event) => {
    this.setState({ caption: event.target.value });
  };

  handleCTAChange = (event) => {
    this.setState({ cta: event.target.value });
  };

  handleColorChange = (color) => {
    this.setState({ backgroundColor: color.hex });
    const recentColors = [...this.state.recentColors, color.hex];
    this.setState({ recentColors: recentColors.slice(-5) });
  };

  handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({ imageData: file });
      };
      reader.readAsDataURL(file);
    }
  };

  toggleColorPicker = () => {
    this.setState({ showColorPicker: !this.state.showColorPicker });
  };

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ... (rest of the methods remain the same)

  render() {
    return (
      <div className="container mx-auto py-8">
        <div className="h-full items-center flex justify-center align-middle">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e3e3e3",
            }}
          >
            <canvas
              ref={this.canvasRef}
              width={1080}
              height={1080}
              className="w-96 h-96"
              style={{ margin: "70px" }}
            />
          </div>
          <div style={{ marginLeft: "90px" }}>
            <h1 style={{ fontSize: "30px", fontWeight: 800 }}>
              {" "}
              Add Customization{" "}
            </h1>
            <div className="mt-4">
              <input
                type="text"
                value={this.state.caption}
                onChange={this.handleCaptionChange}
                placeholder="Enter caption"
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={this.state.cta}
                onChange={this.handleCTAChange}
                placeholder="Enter CTA"
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="mt-4 flex items-center">
              {this.state.recentColors.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full mx-1 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => this.handleColorChange({ hex: color })}
                />
              ))}
              <button
                className="bg-gray-300 rounded px-2 py-1 ml-2"
                onClick={this.toggleColorPicker}
              >
                +
              </button>
              {this.state.showColorPicker && (
                <div className="absolute top-13 right-12 z-10">
                  <CompactPicker
                    color={this.state.backgroundColor}
                    onChangeComplete={this.handleColorChange}
                  />
                </div>
              )}
            </div>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                ref={this.fileInputRef}
                onChange={this.handleImageUpload}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CanvasEditor;
