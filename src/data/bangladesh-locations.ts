/**
 * Comprehensive Dataset of 64 Districts and Upazilas/Thanas in Bangladesh
 */

export interface DistrictData {
  name: string;
  isDhaka: boolean; // Inside Dhaka vs Outside Dhaka shipping fee calculation
  upazilas: string[];
}

export const BANGLADESH_DISTRICTS: DistrictData[] = [
  {
    name: 'Dhaka',
    isDhaka: true,
    upazilas: [
      'Adabor', 'Badda', 'Bangshal', 'Biman Bandar', 'Cantonment', 'Chalkbazar',
      'Dhanmondi', 'Demra', 'Gendaria', 'Gulshan', 'Hazaribagh', 'Jatrabari',
      'Kadamtali', 'Kafrul', 'Kalabagan', 'Kamrangirchar', 'Khilgaon', 'Khilkhet',
      'Kotwali', 'Lalbagh', 'Mirpur', 'Mohammadpur', 'Motijheel', 'New Market',
      'Paltan', 'Ramna', 'Rampura', 'Sabujbagh', 'Sadarghat', 'Shah Ali',
      'Shahbagh', 'Sher-e-Bangla Nagar', 'Shyampur', 'Sutrapur', 'Tejgaon',
      'Tejgaon Industrial Area', 'Turag', 'Uttara East', 'Uttara West', 'Vatara',
      'Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'
    ],
  },
  {
    name: 'Gazipur',
    isDhaka: false,
    upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi'],
  },
  {
    name: 'Narayanganj',
    isDhaka: false,
    upazilas: ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon', 'Siddhirganj'],
  },
  {
    name: 'Chattogram',
    isDhaka: false,
    upazilas: [
      'Agrabad', 'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Double Mooring',
      'Fatikchhari', 'Hathazari', 'Kotwali', 'Lohagara', 'Mirsharai', 'Patiya',
      'Panchlaish', 'Rangunia', 'Raozan', 'Sadarghat', 'Sandwip', 'Satkania',
      'Sitakunda', 'Halishahar', 'Khulshi', 'Pahartali'
    ],
  },
  {
    name: 'Sylhet',
    isDhaka: false,
    upazilas: [
      'Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj',
      'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat',
      'Zakiganj', 'South Surma', 'Osmani Nagar'
    ],
  },
  {
    name: 'Rajshahi',
    isDhaka: false,
    upazilas: [
      'Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum', 'Chandrima', 'Kashia',
      'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur',
      'Paba', 'Puthia', 'Tanore'
    ],
  },
  {
    name: 'Khulna',
    isDhaka: false,
    upazilas: [
      'Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra',
      'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Sonadanga', 'Khalishpur'
    ],
  },
  {
    name: 'Barishal',
    isDhaka: false,
    upazilas: [
      'Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara',
      'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'
    ],
  },
  {
    name: 'Rangpur',
    isDhaka: false,
    upazilas: [
      'Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur',
      'Pirgachha', 'Pirganj', 'Taraganj'
    ],
  },
  {
    name: 'Mymensingh',
    isDhaka: false,
    upazilas: [
      'Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gafargaon',
      'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail',
      'Phulpur', 'Trishal', 'TaraKanda'
    ],
  },
  {
    name: 'Comilla (Cumilla)',
    isDhaka: false,
    upazilas: [
      'Cumilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina',
      'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam',
      'Muradnagar', 'Nangalkot', 'Titas', 'Monohargonj', 'Meghna'
    ],
  },
  {
    name: 'Bogura',
    isDhaka: false,
    upazilas: [
      'Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali',
      'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur',
      'Shibganj', 'Sonatola'
    ],
  },
  {
    name: 'Cox\'s Bazar',
    isDhaka: false,
    upazilas: [
      'Cox\'s Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Ramu',
      'Teknaf', 'Ukhia', 'Pekua'
    ],
  },
  {
    name: 'Noakhali',
    isDhaka: false,
    upazilas: [
      'Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya',
      'Senbagh', 'Subarnachar', 'Sonaimuri', 'Kabirhat'
    ],
  },
  {
    name: 'Feni',
    isDhaka: false,
    upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Porshuram', 'Fulgazi', 'Sonavazi'],
  },
  {
    name: 'Brahmanbaria',
    isDhaka: false,
    upazilas: [
      'Brahmanbaria Sadar', 'Ashuganj', 'Banchharampur', 'Kasba', 'Nabinagar',
      'Nasirnagar', 'Sarail', 'Bijoynagar', 'Akhaura'
    ],
  },
  {
    name: 'Tangail',
    isDhaka: false,
    upazilas: [
      'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur',
      'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari'
    ],
  },
  {
    name: 'Faridpur',
    isDhaka: false,
    upazilas: [
      'Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan',
      'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'
    ],
  },
  {
    name: 'Jessore (Jashore)',
    isDhaka: false,
    upazilas: [
      'Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha',
      'Keshabpur', 'Manirampur', 'Sharsha'
    ],
  },
  {
    name: 'Pabna',
    isDhaka: false,
    upazilas: [
      'Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar',
      'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'
    ],
  },
  {
    name: 'Dinajpur',
    isDhaka: false,
    upazilas: [
      'Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj',
      'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole',
      'Khansama', 'Nawabganj', 'Parbatipur'
    ],
  },
  {
    name: 'Kushtia',
    isDhaka: false,
    upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Daulatpur', 'Mirpur', 'Bheramara', 'Khoksa'],
  },
  {
    name: 'Habiganj',
    isDhaka: false,
    upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Baniachong', 'Bahubal', 'Chhatak', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj'],
  },
  {
    name: 'Moulvibazar',
    isDhaka: false,
    upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'],
  },
  {
    name: 'Sunamganj',
    isDhaka: false,
    upazilas: ['Sunamganj Sadar', 'Bishwamambharpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur'],
  },
  {
    name: 'Narsingdi',
    isDhaka: false,
    upazilas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'],
  },
  {
    name: 'Munshiganj',
    isDhaka: false,
    upazilas: ['Munshiganj Sadar', 'Gazaria', 'Tongibari', 'Sirajdikhan', 'Lohajang', 'Sreenagar'],
  },
  {
    name: 'Manikganj',
    isDhaka: false,
    upazilas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Ghior', 'Shivalaya', 'Harirampur', 'Daulatpur'],
  },
  {
    name: 'Kishoreganj',
    isDhaka: false,
    upazilas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'],
  },
  {
    name: 'Jamalpur',
    isDhaka: false,
    upazilas: ['Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Isampur', 'Madarganj', 'Melandaha', 'Sarishabari'],
  },
  {
    name: 'Sherpur',
    isDhaka: false,
    upazilas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'],
  },
  {
    name: 'Netrokona',
    isDhaka: false,
    upazilas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendra', 'Madan', 'Mohanganj', 'Purbadhala'],
  },
  {
    name: 'Rajbari',
    isDhaka: false,
    upazilas: ['Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'],
  },
  {
    name: 'Gopalganj',
    isDhaka: false,
    upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'],
  },
  {
    name: 'Madaripur',
    isDhaka: false,
    upazilas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'],
  },
  {
    name: 'Shariatpur',
    isDhaka: false,
    upazilas: ['Shariatpur Sadar', 'Damudya', 'Naria', 'Janjira', 'Bhedarganj', 'Gosairhat'],
  },
  {
    name: 'Satkhira',
    isDhaka: false,
    upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
  },
  {
    name: 'Bagerhat',
    isDhaka: false,
    upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
  },
  {
    name: 'Narail',
    isDhaka: false,
    upazilas: ['Narail Sadar', 'Kalia', 'Lohagara'],
  },
  {
    name: 'Magura',
    isDhaka: false,
    upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
  },
  {
    name: 'Jhenaidah',
    isDhaka: false,
    upazilas: ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Moheshpur', 'Shailkupa'],
  },
  {
    name: 'Chuadanga',
    isDhaka: false,
    upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'],
  },
  {
    name: 'Meherpur',
    isDhaka: false,
    upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'],
  },
  {
    name: 'Natore',
    isDhaka: false,
    upazilas: ['Natore Sadar', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Naldanga', 'Singra'],
  },
  {
    name: 'Naogaon',
    isDhaka: false,
    upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar', 'Mohadevpur'],
  },
  {
    name: 'Sirajganj',
    isDhaka: false,
    upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Rayganj', 'Shahjadpur', 'Tarash', 'Ullapara'],
  },
  {
    name: 'Joypurhat',
    isDhaka: false,
    upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'],
  },
  {
    name: 'Chapai Nawabganj',
    isDhaka: false,
    upazilas: ['Chapai Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'],
  },
  {
    name: 'Gaibandha',
    isDhaka: false,
    upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'],
  },
  {
    name: 'Kurigram',
    isDhaka: false,
    upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat', 'Roumari', 'Ulipur'],
  },
  {
    name: 'Lalmonirhat',
    isDhaka: false,
    upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'],
  },
  {
    name: 'Nilphamari',
    isDhaka: false,
    upazilas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'],
  },
  {
    name: 'Panchagarh',
    isDhaka: false,
    upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'],
  },
  {
    name: 'Thakurgaon',
    isDhaka: false,
    upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'],
  },
  {
    name: 'Bhola',
    isDhaka: false,
    upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
  },
  {
    name: 'Patuakhali',
    isDhaka: false,
    upazilas: ['Patuakhali Sadar', 'Bawalfal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali', 'Dumki'],
  },
  {
    name: 'Pirojpur',
    isDhaka: false,
    upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Zianagar'],
  },
  {
    name: 'Barguna',
    isDhaka: false,
    upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'],
  },
  {
    name: 'Jhalokati',
    isDhaka: false,
    upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
  },
  {
    name: 'Patuakhali / Barguna Coastal',
    isDhaka: false,
    upazilas: ['Coastal Hub', 'Island Zone'],
  },
  {
    name: 'Chandpur',
    isDhaka: false,
    upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Hajiganj', 'Kachua', 'Matlab North', 'Matlab South', 'Shahrasti'],
  },
  {
    name: 'Lakshmipur',
    isDhaka: false,
    upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'],
  },
  {
    name: 'Khagrachhari',
    isDhaka: false,
    upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'],
  },
  {
    name: 'Rangamati',
    isDhaka: false,
    upazilas: ['Rangamati Sadar', 'Belaichhari', 'Bhuapur', 'Barkal', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali'],
  },
  {
    name: 'Bandarban',
    isDhaka: false,
    upazilas: ['Bandarban Sadar', 'Ali Kadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'],
  },
];
