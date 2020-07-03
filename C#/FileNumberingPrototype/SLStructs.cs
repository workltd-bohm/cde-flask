using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileNumberingPrototype
{
    class SLStructs
    {
        public struct StringStringStruct
        {
            public StringStringStruct(string code, string name)
            {
                Code = code;
                Name = name;
            }

            public string Code { get; }
            public string Name { get; }
        }

        public struct IntStringStruct
        {
            public IntStringStruct(int code, string name)
            {
                Code = code;
                Name = name;
            }

            public int    Code { get; }
            public string Name { get; }
        }
    }
}
