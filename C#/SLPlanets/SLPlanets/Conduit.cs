using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rhino.Geometry;

namespace SLPlanets
{
    public class Conduit  : Rhino.Display.DisplayConduit
    {
        public  PlanetarySystem  ps       { get; set;}
        public  Polyline      rec      { get; set;}
        //public  Planet          Sun     { get; set;}
        //public  List<Planet>    Planets { get; set;}

          protected override void CalculateBoundingBox(Rhino.Display.CalculateBoundingBoxEventArgs e)
          {
            if(ps != null)
            {
                if (null != ps.Sun)
                {                
                    e.IncludeBoundingBox(ps.Sun.Circle.BoundingBox);

                    if( null != ps.Planets && ps.Planets.Count >0)
                    {
                        foreach(Planet planet in ps.Planets)
                        {                       
                            e.IncludeBoundingBox(planet.Circle.BoundingBox);
                        } 
                    }
                }
            }

            if(rec.IsValid)
            {
                e.IncludeBoundingBox(rec.BoundingBox);
            }

          }

          protected override void PostDrawObjects(Rhino.Display.DrawEventArgs e)
          {
                if(ps != null)
                {
                    if (null != ps.Sun)
                    {                
                        e.Display.DrawCircle(ps.Sun.Circle, System.Drawing.Color.Black);

                        if( null != ps.Planets && ps.Planets.Count >0)
                        {
                            foreach(Planet planet in ps.Planets)
                            {      
                                if(planet.Empty)
                                    e.Display.DrawCircle(planet.Circle, System.Drawing.Color.LightGray);
                                else
                                    e.Display.DrawCircle(planet.Circle, System.Drawing.Color.DarkGray);
                            } 
                        }
                    }
                }

                if(rec.IsValid)
                {
                    e.Display.DrawPolyline(rec, System.Drawing.Color.Black);
                }
          }
    }
}
