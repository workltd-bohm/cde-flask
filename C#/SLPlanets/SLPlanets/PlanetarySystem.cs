using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rhino.Geometry;

namespace SLPlanets
{
    public class PlanetarySystem
    {
        public  Planet          Sun     { get; set;}
        public  List<Planet>    Planets { get; set;}

        private double          SunToFrameDiagonalRatio { get; set;}
        private double          PlanetDistFromTheSun    { get; set;}
        private double          PlanetToSunRatio        { get; set;}
        private double          NameDistFromTheSun      { get; set;}
        private double          NameToPlanetRatio       { get; set;}

        private double          FrameWidth       { get; set;}
        private double          FrameHeight       { get; set;}
        private int             NrOfPlanets       { get; set;}



        public PlanetarySystem(     double frameWidth, 
                                    double frameHeight, 
                                    int    nrOfPlanets,
                                    double sunToFrameDiagonalRatio,
                                    double planetDistFromTheSun,
                                    double planetToSunRatio,   
                                    double nameDistFromTheSun,  
                                    double nameToPlanetRatio   
                                    )
        {
            SunToFrameDiagonalRatio =   sunToFrameDiagonalRatio    ;
            PlanetDistFromTheSun    =   planetDistFromTheSun       ;
            PlanetToSunRatio        =   planetToSunRatio           ;
            NameDistFromTheSun      =   nameDistFromTheSun         ;
            NameToPlanetRatio       =   nameToPlanetRatio          ;

            FrameWidth              =   frameWidth                  ; 
            FrameHeight             =   frameHeight                 ;
            NrOfPlanets             =   nrOfPlanets                 ;
            

            ReGeneratePS();
        }

        public void ReGeneratePS()
        {
            double diagonal = Math.Sqrt( FrameWidth*FrameWidth + FrameHeight*FrameHeight);

            double sunRadius = diagonal * SunToFrameDiagonalRatio;     
            
            Sun = new Planet(new Point3d(0,0,0), sunRadius, false);

            Vector3d planetVec = Vector3d.XAxis;
            double rotationRad = 2*Math.PI / NrOfPlanets;
            planetVec = planetVec * PlanetDistFromTheSun * sunRadius;
            double planetRadius = PlanetToSunRatio * sunRadius;

            Planets = new List<Planet>();

            for(int i=0; i<NrOfPlanets; i++)
            {
                planetVec.Rotate(rotationRad, Vector3d.ZAxis );

                Planets.Add(new Planet(Point3d.Origin+ planetVec, planetRadius, false));
            }
        }
    }
}
