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
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace FileNumberingPrototype
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();                   
            SLLists slLists = new SLLists();

            cb_VolumeSystem.ItemsSource = slLists.VolumeSystem;

            
        }

        private void UserOnClick(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("TEST");
        }

        private void Cb_VolumeSystem_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

            
        }

    }
}
