using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rhino;
using Rhino.Geometry;

namespace SLPlanets
{
    public class Planet
    {
        public  Circle  Circle      { get; set; }
        public  bool    Empty       { get; set; }
        public  string  Name        { get; set;}

        public Planet(Point3d center, double radius, bool empty)
        {
            if(Math.Abs(radius) < 0.0001)
                radius = 1;

            Circle = new Circle(center,radius);

            Empty = empty;
        }
    }
}
