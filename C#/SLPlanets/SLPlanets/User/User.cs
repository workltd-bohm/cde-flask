using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    enum Role
    {   

        Architect                       ,   //A
        BuildingSurveyor               ,   //B
        CivilEngineer                  ,   //C
        DrainageHighway               ,   //D
        ElectricalEngineer             ,   //E
        FacilitiesManager              ,   //F
        GeographicalLandSurveyor      ,   //G
        HeatingVentilationDesigner  ,   //H
        InteriorDesigner               ,   //I
        Client                          ,   //K
        LandscapeArchitect             ,   //L
        MechanicalEngineer             ,   //M
        PublicHealthEngineer          ,   //P
        QuantitySurveyor               ,   //Q
        StructuralEngineer             ,   //S
        TownPlanner                    ,   //T
        Contractor                      ,   //W
        Subcontractor                   ,   //X
        SpecialistDesigner             ,   //Y
        General                             //Z  
        ///...
    }

    class User
    {
        public  Guid    guid        { get; set; }
        public  string  userName    { get; set; }
        public  string  eMail       { get; set; }
        public  string  password    { get; set; }

        //Company that this user works for
        public  Company company     { get; set; }

        //Role is important later for renaming as well - every role is described by one letter Client is K for example
        public  Role    role        { get; set; }

        //Projects that this user is involved with
        public  List<ICProject> projects    { get; set; }

    }
}
