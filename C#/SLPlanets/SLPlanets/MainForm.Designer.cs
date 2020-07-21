namespace SLPlanets
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.sl_FrameWidth = new System.Windows.Forms.TrackBar();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.sl_FrameHeight = new System.Windows.Forms.TrackBar();
            this.label3 = new System.Windows.Forms.Label();
            this.sl_NrOfPlanets = new System.Windows.Forms.TrackBar();
            this.n_SunToFrame = new System.Windows.Forms.NumericUpDown();
            this.label4 = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.n_PlanetDistFromSun = new System.Windows.Forms.NumericUpDown();
            this.label6 = new System.Windows.Forms.Label();
            this.n_PlanetToSunRatio = new System.Windows.Forms.NumericUpDown();
            this.label7 = new System.Windows.Forms.Label();
            this.n_NameDistFromThePlanet = new System.Windows.Forms.NumericUpDown();
            this.label8 = new System.Windows.Forms.Label();
            this.n_NameToPlanetRatio = new System.Windows.Forms.NumericUpDown();
            this.button1 = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.sl_FrameWidth)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.sl_FrameHeight)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.sl_NrOfPlanets)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_SunToFrame)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_PlanetDistFromSun)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_PlanetToSunRatio)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_NameDistFromThePlanet)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_NameToPlanetRatio)).BeginInit();
            this.SuspendLayout();
            // 
            // sl_FrameWidth
            // 
            this.sl_FrameWidth.Location = new System.Drawing.Point(13, 46);
            this.sl_FrameWidth.Maximum = 1920;
            this.sl_FrameWidth.Minimum = 200;
            this.sl_FrameWidth.Name = "sl_FrameWidth";
            this.sl_FrameWidth.Size = new System.Drawing.Size(440, 45);
            this.sl_FrameWidth.TabIndex = 0;
            this.sl_FrameWidth.Value = 1000;
            this.sl_FrameWidth.ValueChanged += new System.EventHandler(this.FrameWidthChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(460, 46);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(64, 13);
            this.label1.TabIndex = 1;
            this.label1.Text = "FrameWidth";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(460, 97);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(67, 13);
            this.label2.TabIndex = 3;
            this.label2.Text = "FrameHeight";
            // 
            // sl_FrameHeight
            // 
            this.sl_FrameHeight.Location = new System.Drawing.Point(13, 97);
            this.sl_FrameHeight.Maximum = 1080;
            this.sl_FrameHeight.Minimum = 200;
            this.sl_FrameHeight.Name = "sl_FrameHeight";
            this.sl_FrameHeight.Size = new System.Drawing.Size(440, 45);
            this.sl_FrameHeight.TabIndex = 2;
            this.sl_FrameHeight.Value = 1000;
            this.sl_FrameHeight.ValueChanged += new System.EventHandler(this.FrameHeightChanged);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(460, 148);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(64, 13);
            this.label3.TabIndex = 5;
            this.label3.Text = "NrOfPlanets";
            // 
            // sl_NrOfPlanets
            // 
            this.sl_NrOfPlanets.Location = new System.Drawing.Point(13, 148);
            this.sl_NrOfPlanets.Maximum = 100;
            this.sl_NrOfPlanets.Name = "sl_NrOfPlanets";
            this.sl_NrOfPlanets.Size = new System.Drawing.Size(440, 45);
            this.sl_NrOfPlanets.TabIndex = 4;
            this.sl_NrOfPlanets.Value = 7;
            this.sl_NrOfPlanets.ValueChanged += new System.EventHandler(this.NeOfPlanetsChanged);
            // 
            // n_SunToFrame
            // 
            this.n_SunToFrame.DecimalPlaces = 2;
            this.n_SunToFrame.Increment = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.n_SunToFrame.Location = new System.Drawing.Point(13, 199);
            this.n_SunToFrame.Maximum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.n_SunToFrame.Name = "n_SunToFrame";
            this.n_SunToFrame.Size = new System.Drawing.Size(120, 20);
            this.n_SunToFrame.TabIndex = 6;
            this.n_SunToFrame.Value = new decimal(new int[] {
            2,
            0,
            0,
            65536});
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(149, 201);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(216, 13);
            this.label4.TabIndex = 7;
            this.label4.Text = "SunToFrameDiagonalRatio (Sun / Diagonal)";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(149, 231);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(188, 13);
            this.label5.TabIndex = 9;
            this.label5.Text = "PlanetDistFromTheSun (x Sun Radius)";
            // 
            // n_PlanetDistFromSun
            // 
            this.n_PlanetDistFromSun.DecimalPlaces = 2;
            this.n_PlanetDistFromSun.Increment = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.n_PlanetDistFromSun.Location = new System.Drawing.Point(13, 229);
            this.n_PlanetDistFromSun.Maximum = new decimal(new int[] {
            2,
            0,
            0,
            0});
            this.n_PlanetDistFromSun.Minimum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.n_PlanetDistFromSun.Name = "n_PlanetDistFromSun";
            this.n_PlanetDistFromSun.Size = new System.Drawing.Size(120, 20);
            this.n_PlanetDistFromSun.TabIndex = 8;
            this.n_PlanetDistFromSun.Value = new decimal(new int[] {
            13,
            0,
            0,
            65536});
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(149, 264);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(235, 13);
            this.label6.TabIndex = 11;
            this.label6.Text = "PlanetToSunRatio (Planet Radius / Sun Radius)";
            // 
            // n_PlanetToSunRatio
            // 
            this.n_PlanetToSunRatio.DecimalPlaces = 2;
            this.n_PlanetToSunRatio.Increment = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.n_PlanetToSunRatio.Location = new System.Drawing.Point(13, 262);
            this.n_PlanetToSunRatio.Maximum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.n_PlanetToSunRatio.Name = "n_PlanetToSunRatio";
            this.n_PlanetToSunRatio.Size = new System.Drawing.Size(120, 20);
            this.n_PlanetToSunRatio.TabIndex = 10;
            this.n_PlanetToSunRatio.Value = new decimal(new int[] {
            3,
            0,
            0,
            65536});
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(149, 298);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(208, 13);
            this.label7.TabIndex = 13;
            this.label7.Text = "NameDistFromThePlanet (x Planet Radius)";
            // 
            // n_NameDistFromThePlanet
            // 
            this.n_NameDistFromThePlanet.DecimalPlaces = 2;
            this.n_NameDistFromThePlanet.Increment = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.n_NameDistFromThePlanet.Location = new System.Drawing.Point(13, 296);
            this.n_NameDistFromThePlanet.Maximum = new decimal(new int[] {
            5,
            0,
            0,
            0});
            this.n_NameDistFromThePlanet.Minimum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.n_NameDistFromThePlanet.Name = "n_NameDistFromThePlanet";
            this.n_NameDistFromThePlanet.Size = new System.Drawing.Size(120, 20);
            this.n_NameDistFromThePlanet.TabIndex = 12;
            this.n_NameDistFromThePlanet.Value = new decimal(new int[] {
            15,
            0,
            0,
            65536});
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(149, 332);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(230, 13);
            this.label8.TabIndex = 15;
            this.label8.Text = "NameToPlanetRatio (TextSize / Planet Radius)\r\n";
            // 
            // n_NameToPlanetRatio
            // 
            this.n_NameToPlanetRatio.DecimalPlaces = 2;
            this.n_NameToPlanetRatio.Increment = new decimal(new int[] {
            1,
            0,
            0,
            131072});
            this.n_NameToPlanetRatio.Location = new System.Drawing.Point(13, 330);
            this.n_NameToPlanetRatio.Maximum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.n_NameToPlanetRatio.Name = "n_NameToPlanetRatio";
            this.n_NameToPlanetRatio.Size = new System.Drawing.Size(120, 20);
            this.n_NameToPlanetRatio.TabIndex = 14;
            this.n_NameToPlanetRatio.Value = new decimal(new int[] {
            3,
            0,
            0,
            65536});
            // 
            // button1
            // 
            this.button1.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            this.button1.Location = new System.Drawing.Point(13, 371);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(514, 23);
            this.button1.TabIndex = 16;
            this.button1.Text = "Close";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(531, 413);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label8);
            this.Controls.Add(this.n_NameToPlanetRatio);
            this.Controls.Add(this.label7);
            this.Controls.Add(this.n_NameDistFromThePlanet);
            this.Controls.Add(this.label6);
            this.Controls.Add(this.n_PlanetToSunRatio);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.n_PlanetDistFromSun);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.n_SunToFrame);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.sl_NrOfPlanets);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.sl_FrameHeight);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.sl_FrameWidth);
            this.Name = "MainForm";
            this.Text = "MainForm";
            ((System.ComponentModel.ISupportInitialize)(this.sl_FrameWidth)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.sl_FrameHeight)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.sl_NrOfPlanets)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_SunToFrame)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_PlanetDistFromSun)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_PlanetToSunRatio)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_NameDistFromThePlanet)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.n_NameToPlanetRatio)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TrackBar sl_FrameWidth;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TrackBar sl_FrameHeight;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TrackBar sl_NrOfPlanets;
        private System.Windows.Forms.NumericUpDown n_SunToFrame;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.NumericUpDown n_PlanetDistFromSun;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.NumericUpDown n_PlanetToSunRatio;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.NumericUpDown n_NameDistFromThePlanet;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.NumericUpDown n_NameToPlanetRatio;
        private System.Windows.Forms.Button button1;
    }
}