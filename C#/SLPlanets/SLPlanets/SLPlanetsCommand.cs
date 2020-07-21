using System;
using System.Collections.Generic;
using System.Windows.Forms;
using Rhino;
using Rhino.Commands;
using Rhino.Geometry;
using Rhino.Input;
using Rhino.Input.Custom;
using RhinoWindows;

namespace SLPlanets
{
    public class SLPlanetsCommand : Command
    {
        private MainForm mainForm { get; set; }
        //static  Conduit  conduit;

        public SLPlanetsCommand()
        {
            // Rhino only creates one instance of each command class defined in a
            // plug-in, so it is safe to store a refence in a static property.
            Instance = this;
            
        }

        ///<summary>The only instance of this command.</summary>
        public static SLPlanetsCommand Instance
        {
            get; private set;
        }

        ///<returns>The command name as it appears on the Rhino command line.</returns>
        public override string EnglishName
        {
            get { return "SLPlanets"; }
        }

        protected override Result RunCommand(RhinoDoc doc, RunMode mode)
        {
            if (null == mainForm)
            {
                mainForm = new MainForm(doc);

                mainForm.FormClosed += OnFormClosed;

                mainForm.Show(RhinoWinApp.MainWindow);

                //CONDUIT
                    //if (conduit == null)
                    //{
                     // conduit = new Conduit { Enabled = true };                    
                    //}

            }
            return Result.Success;
        }

        private void OnFormClosed(object sender, FormClosedEventArgs e)
        {
            mainForm.Dispose();
            mainForm = null;

                    /*if (conduit != null)
                    {
                        conduit.Enabled = false;
                        conduit = null;
                    }*/

            //RhinoApp.WriteLine("Form Closed");

        }
    }
}
