using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace FileNumberingPrototype
{
    /// <summary>
    /// Interaction logic for UserWindow.xaml
    /// </summary>
    public partial class UserWindow : Window
    {
        public User user { get; set;}


        public UserWindow(SLLists sll)
        {
            InitializeComponent();

            if(sll.Role != null)
            {
                cb_Role.ItemsSource     = sll.Role; 
            }                

        }
    }
}
