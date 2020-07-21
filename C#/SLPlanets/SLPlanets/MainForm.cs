using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Rhino;
using Rhino.Geometry;

namespace SLPlanets
{
    public partial class MainForm : Form
    {
        private RhinoDoc docform;
        //public PlanetarySystem PS;
        static  Conduit  docconduit;

        public MainForm(RhinoDoc doc)
        {
            InitializeComponent();

            docform = doc;
            docconduit = new Conduit { Enabled = true };  

            /*PS = new PlanetarySystem(   (double)sl_FrameWidth.Value, 
                                        (double)sl_FrameHeight.Value,
                                        sl_NrOfPlanets.Value,
                                        (double)n_SunToFrame.Value,
                                        (double)n_PlanetDistFromSun.Value,
                                        (double)n_PlanetToSunRatio.Value,
                                        (double)n_NameDistFromThePlanet.Value,
                                        (double)n_NameToPlanetRatio.Value);*/
        }

        private void FrameHeightChanged(object sender, System.EventArgs e)
        {
            //RhinoApp.WriteLine("FrameHeightChanged new value: {0}", sl_FrameHeight.Value);
            UpdateSystem();
        }

        private void FrameWidthChanged(object sender, System.EventArgs e)
        {
            //RhinoApp.WriteLine("FrameWidthChanged new value: {0}", sl_FrameWidth.Value);
            UpdateSystem();
        }

        private void NeOfPlanetsChanged(object sender, System.EventArgs e)
        {
            //RhinoApp.WriteLine("NeOfPlanetsChanged new value: {0}", sl_NrOfPlanets.Value);
            UpdateSystem();
        }

        private void UpdateSystem()
        {

                //PS = null;
                docconduit.ps = new PlanetarySystem(   (double)sl_FrameWidth.Value, 
                                            (double)sl_FrameHeight.Value,
                                            sl_NrOfPlanets.Value,
                                            (double)n_SunToFrame.Value,
                                            (double)n_PlanetDistFromSun.Value,
                                            (double)n_PlanetToSunRatio.Value,
                                            (double)n_NameDistFromThePlanet.Value,
                                            (double)n_NameToPlanetRatio.Value);

                docconduit.rec = new Rhino.Geometry.Polyline();
                            docconduit.rec.Add(new Point3d(-sl_FrameHeight.Value/2, - sl_FrameWidth.Value/2, 0 ));
                            docconduit.rec.Add(new Point3d(-sl_FrameHeight.Value/2, + sl_FrameWidth.Value/2, 0 ));
                            docconduit.rec.Add(new Point3d(+sl_FrameHeight.Value/2, + sl_FrameWidth.Value/2, 0 ));
                            docconduit.rec.Add(new Point3d(+sl_FrameHeight.Value/2, - sl_FrameWidth.Value/2, 0 ));
                            docconduit.rec.Add(new Point3d(-sl_FrameHeight.Value/2, - sl_FrameWidth.Value/2, 0 ));

                //UPDATE CONDUIT
                docform.Views.Redraw();              


        }

        private void button1_Click(object sender, EventArgs e)
        {
                    if (docconduit != null)
                    {
                        docconduit.Enabled = false;
                        docconduit = null;
                    }
        }
    }
}
