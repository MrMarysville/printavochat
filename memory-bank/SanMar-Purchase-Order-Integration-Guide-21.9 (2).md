1
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
 
Update d:
 
J uly
 
202
4
 
 
 
 
 
 
SanMar
 
 
Purc hase
 
Or der
 
Integ ration
 
Guide
 
FTP
 
&
 
W eb
 
Se rvice s
 
Orde r
 
Submissi on
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
Co pyright
 
©
 
202
3
 
SanMar
 
Co rpo r atio n.
 
All
 
R i ght s
 
R es erve d
 
No
 
part
 
of
 
this
 
p ublic atio n
 
may
 
be
 
r epro d uc ed
 
or
 
tran sc ribe d 
in any fo rm w itho ut pe rmiss io n o f the pu bli she r.
 


2
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Table
 
of
 
Contents
 
Es tabl ish in g
 
Or d er
 
Integration
 
................................
................................
..........................
 
4
 
Authentication
 
................................
................................
................................
................................
........................
 
4
 
Payment
 
Meth o ds
 
................................
................................
................................
................................
...................
 
4
 
Th ird
 
Pa rty
 
Serv ice
 
Provid ers
 
................................
................................
................................
................................
..
 
4
 
Bran d
 
Restrictions
 
................................
................................
................................
................................
...................
 
5
 
Ma p
 
Pricing
 
................................
................................
................................
................................
.............................
 
5
 
Global
 
Trade
 
Item
 
Numbers
 
(GTIN)
 
................................
................................
................................
.........................
 
5
 
Shi p pi n g
 
Information
 
................................
................................
................................
........
 
6
 
Shipping
 
Cuto ff
 
Times
 
................................
................................
................................
................................
.............
 
6
 
Shipping
 
Free
 
Freight
 
Policy
 
................................
................................
................................
................................
....
 
6
 
FTP
 
Serv er
 
Sh ip p in g
 
Info rmation
................................
................................
................................
.............................
 
6
 
PSST
 
(Pa ck
 
Sep ar at ely .
 
Sh ip
 
To geth er.)
 
................................
................................
................................
...................
 
7
 
San Ma r
 
Sta n d ar d
 
Sh ip
 
Methods
 
................................
................................
................................
.............................
 
7
 
SanMar
 
Pro mo Standards
 
Ship
 
Methods
 
................................
................................
................................
.................
 
7
 
San Ma r
 
Wa reh o u s e
 
Will
 
Cal l
 
S h ip
 
Methods
 
................................
................................
................................
............
 
8
 
Integrated
 
Ordering
 
Sh ipping
 
Options
 
................................
................................
................................
....................
 
9
 
Option
 
1:
 
Warehou se
 
Conso lidation
 
(Defau lt
 
Inte gration
 
Ac count
 
Configuration)
 
................................
...........
 
9
 
Option
 
2:
 
Auto
-
split
 
shipments
 
(Inte gration
 
Account
 
Modification
 
Required)
 
................................
.................
 
9
 
Option
 
3:
 
Warehouse
 
Selectio n
 
(Integration
 
Account
 
Modification
 
Required)
 
................................
................
 
9
 
Order
 
Pro cessing
 
In formation
 
................................
................................
................................
...............................
 
10
 
I n tegr ated
 
O rd er
 
Testing
 
................................
................................
................................
 
11
 
E DE V
 
Tes t
 
Verifi c ati o n
 
................................
................................
................................
................................
...........
 
11
 
Production
 
Setup
 
................................
................................
................................
................................
..................
 
12
 
FT P
 
an d
 
W eb
 
Ser vic e
 
Ord er
 
I n tegr ation :
 
Fil e
 
Pr ocessi n g
 
Overview
 
................................
...
 
13
 
Integration
 
Ord er
 
Fold er
 
Detai l s
 
................................
................................
................................
............................
 
13
 
San Mar
 
Stan d ar d
 
T ext
 
Fil e
 
O r d er
 
Integration
 
................................
................................
..
 
14
 
Text
 
Fil e
 
Bat ch
 
N ame
 
Formatting
 
................................
................................
................................
..........................
 
14
 
Details.txt
 
FileFormatting
 
................................
................................
................................
................................
.....
 
15
 
CustInfo.txtFile
 
Fo rmatt i n g
 
................................
................................
................................
................................
...
 
16
 
Release.txt
 
File
 
Formattin g
 
................................
................................
................................
................................
...
 
17
 
Holding.txt
 
File
 
(Ord er
 
Ackno wledgement)
 
................................
................................
................................
...........
 
18
 
San Mar
 
Stan d ar d
 
W eb
 
Ser vic es
 
O r d er
 
Integration
 
................................
..........................
 
19
 
SanMar getPreSub mitIn fo
 
Serv ice
 
................................
................................
................................
........................
 
20
 
SanMar
 
getPre SubmitInfo
 
Service
 
Request
 
Parameter s
 
................................
................................
................
 
20
 
SanMar
 
getPreSubmitInfo
 
Ser vice
 
XML
 
Request:
 
................................
................................
..........................
 
21
 
San M ar
 
ge tPr e Su b m itIn fo
 
Se r vic e
 
X M L
 
R e sp o n se
 
Sc e n ar io
 
1
 
-
 
In ve n to r y
 
is
 
available
 
................................
....
 
22
 
San M ar
 
ge tPr e Su b m itIn fo
 
Se r vic e
 
R e sp o n se
 
Sc e n ar io
 
2
 
-
 
In v e n to r y
 
is
 
not
 
available
 
................................
......
 
23
 
San Mar
 
Stan d ar d
 
su b mitPO
 
Service
 
................................
................................
...............
 
24
 


3
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanMar
 
Standard
 
submitPO
 
Service
 
Request
 
Parameters
 
................................
................................
....................
 
24
 
SanMar
 
Standard
 
submitPO
 
Service
 
XML
 
Requ est
 
................................
................................
................................
 
25
 
SanMar
 
Standard
 
submitPO
 
Service
 
XML
 
Response
 
................................
................................
.............................
 
26
 
San Mar
 
Pr omoStan d ar ds
 
W eb
 
Ser vic es
 
O rd er
 
Integration
 
................................
...............
 
27
 
Pr o m o S t a n d ar d s
 
G e t S u p p o rt e d P O D a t a T y p e s
 
Servic e
 
................................
................................
...........................
 
28
 
Pr o m o S t an d ar d s
 
G e t S u p p o r t e d P O D a t a T y p e s
 
S er v ic e
 
R eq u e st
 
Par ameter s
 
................................
....................
 
28
 
Pr o m o S t an d ar d s
 
G et S u p p o r te d P O D a t a T y p e s
 
S e r v ic e
 
XML
 
R equ es t
 
................................
..............................
 
28
 
Pr o m o S t an d ar d s
 
G et S u p p o r t e d P O D a t a T y p e s
 
S er v ic e
 
R e sp o n se
 
Par amete rs
 
................................
..................
 
28
 
Pr o m o S t an d ar d s
 
G et S u p p o r t e d P O D a t a T y p e s
 
S e r v ic e
 
XML
 
R esp o n se
 
................................
............................
 
28
 
Promo StandardsSendPO
 
Servi c e
 
................................
................................
................................
..........................
 
29
 
PromoStandards
 
Send PO
 
Ser vice
 
Request
 
Parameters
 
................................
................................
.................
 
29
 
Promo
S
tandards
 
sendPO
 
Ser vice
 
Request
 
................................
................................
................................
....
 
31
 
Promo
S
tandards
 
sendPO
 
Ser vice
 
Response
 
................................
................................
................................
..
 
33
 
Ch an ge
 
Log
 
................................
................................
................................
....................
 
34
 


4
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Establishing
 
Order Integration
 
 
To  request  purchaseo rderinte gratio naccess, pleaseem ail 
sanm arinte gratio ns@sanm ar.co m
 
and we 
will
 
send
 
y o u
 
o ur
 
inte gration
 
agreement.
 
Once
 
com plete d
 
we
 
will
 
setup
 
acce ss
 
to
 
o ur
 
data
 
and
 
o ur
 
o rder 
te sting e nv iro nment. Order t est ingenv iro nment set up c an t ake2 4
-
4 8  ho urs.
 
 
Authentication
 
 
In
 
o ur
 
pro ductio n
 
env iro nment,
 
yo u
 
can
 
use
 
yo ur
 
ex isting
 
sanm ar.com
 
usernam e
 
and
 
passwo rd.
 
Yo u
 
can 
also  set up a separate webuser acco unt at:
 
https://www.sanmar.com/signup/webuser
 
 
Fo r ED EV set up, 
please co ntact  sanm arinte
g
ratio ns@sanm ar.co m w ithyo ur account num ber and ED EV 
P Oo nbo arding request  details. A mem bero fo ur suppo rtte am will co ntact yo u with further 
instructio ns.
 
 
Paym en t
 
Methods
 
 
Fo r
 
quick
 
and
 
efficient
 
processing
 
of
 
yo ur
 
o rder
 
we
 
require
 
either
 
NET
 
term s
 
or
 
a
 
credit
 
card
 
saved
 
to 
y o ur acco unt o n sanm ar.com . Ify o u hav e quest io ns abo ut NET t erm s, please callthe SanM ar Credit 
D ept(80 0 ) 34 6
-
3 36 9 o r v isit o urwe bsite to  apply  fo r term s:  
https://www.sanmar.com/resources/newcustomer/creditapp
 
 
T h ir d
 
Par ty
 
Ser vic e
 
Providers
 
 
If
 
y o u
 
are
 
an
 
ecom merce
 
or
 
so ftware
 
develo per,
 
please
 
co ntact
 
the
 
SanM ar
 
Inte gratio n
 
suppo rt
 
te am
 
at 
sanm arinte gratio ns@sanmar.com
 
to o btain data access and a test  acco unt.
 
 
P lease let us k no w w henyo u are re ady to  begino rder inte gratio n t esting. The first testo rderwill be 
subm itted
 
under
 
y o ur
 
SanM ar
 
test
 
acco unt
 
num ber
 
in
 
o ur
 
ED EV
 
env iro nm ent.
 
Once
 
y o ur
 
test
 
o rder
 
has 
bee n re ceived and verifiedy o uwill need to  haveo neo r two SanM arcusto mersthat yo u are wo rking 
with to  send a test o rder t o o ur ED EVenv iro nment fo rv erificatio n. Afterv erificatio n, we will t hen 
transitio nyo ur custom ersto o ur pro ductio nenv iro nme
nt for liveo rder subm ission.
 


5
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
 
Brand
 
Restrictions
 
T
he
 
fo llo wing
 
brands
 
are
 
pro hibited
 
from
 
being
 
so ld
 
witho ut
 
em bellishm ent
 
on
 
any
 
third
 
party
 
or
 
direct
 
to
 
co nsume r 
we bsite, including Am azo n, e Bay, and Craigslist:
 
BrooksBrothers
 
EddieBauer
 
OGIO
 
Tomm y  Baham a
 
Carhartt
 
New  E ra
 
The No rth Face
 
TravisMathew
 
Co to paxi
 
Nike
 
 
 
 
 
 
 
Map
 
Pricing
 
 
All custom ersm ust adhereto o urM inim um  Advertised P ricing (M AP) po licy .P ero ur sales po licy , 
custo mers 
m ay no t advertise o r promo te pro ducts at  disco unts greater t han 10 % o ff M SRP o r SanM ar promo tio nal
 
pricing
 
fo r
 
retail
 
items
 
or
 
20 %
 
fo r
 
o ur
 
priv ate
 
label
 
brands. Custom ers m ay  no t adv ertise any  disco unto n 
bags by OGIO.
 
 
M AP 
=
 
10%  O FF M SR P
 
 
MAP 
=
 
20%OFFM SRP
 
MAP 
=
 
MSRP
 
NoMAP
 
AlternativeApparel
 
Outdoo r Re
search
 
AllMade
 
Carhartt
 
Anvil
 
BrooksBrothers
 
Red Ho use
 
Co rnerSto ne
 
NikeBags
 
Bella+Canv as
 
Bulwark
 
Red K ap
 
D istrict
 
Tomm y  Baham a
 
Com fo rt Co lo rs
 
Champion
 
Russell O utdoo rs
 
M ercer+M ettle
 
 
 
Fruit o fthe Loom
 
Cotopaxi
 
Spacecraft
 
P o rt & Com pany
 
 
 
Gildan
 
Eddie Bauer
 
tentree
 
P o rt Authority
 
 
 
Hanes
 
New  E ra
 
The No rth Face
 
Spo rt Tek
 
 
 
Jerzees
 
Nike
 
Trav isM athew
 
Vo lunte er K nitwe ar
 
 
 
Nex tL ev el
 
OGIO
 
WonderWink
 
 
 
 
 
Rabbit Skins
 
 
G lobal
 
Tr ade
 
Item
 
Numb er s
 
(GTIN)
 
 
[’
 
fo r
 
the
 
fo llo wing
 
brands
 
are
 
av ailable
 
in
 
the
 
S anMar _S DL_N.c sv
 
and
 
S anMar _E PDD.c sv
 
files
 
on
 
o ur
 
FTP
 
server:
 
 
Allmade
 
Champion
 
Hanes
 
P o rt Authority
 
tentree
 
Alternative
 
Com fo rt Co lo rs
 
Jerzees
 
P recio us Cargo
 
TheNorthFace
 
Ame rican Apparel
 
Cornerstone
 
Mercer+Mettle
 
Rabbit Skins
 
Tomm y  Baham a
 
Anvil
 
Cotopaxi
 
Nex tL ev el
 
Red Ho use
 
TravisMathew
 
Bella+Canvas
 
District
 
Nike
 
Red K ap
 
VolunteerKnitwear
 
Bro oks Bro thers
 
Eddie Bauer
 
Ogio
 
Russel 
Outdoo rs
 
Wo nderwink
 
Bulwark
 
Fruit o fthe Loom
 
Outdoo r Re
search
 
Spacecraft
 
 
Carhartt
 
Gildan
 
P o rt & Co
 
Spo rttek
 
 


6
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Ship pin g
 
Information
 
 
SanM ar does no t hav especial shipping rate s. Ho wever, yo u c an use o ur UP S shipping 
acco unt at the 
standard
 
rate,
 
or
 
y o ur
 
own
 
shipping
 
acco unt
 
which
 
could
 
delay
 
pro cessing
 
due
 
to
 
the
 
m anual
 
additio n
 
o f 
the s hipping info rm atio n to e acho rder.
 
 
Pl eas e
 
v is i t
 
our
 
w ebsi te
 
for
 
al l
 
our
 
w ar ehous e
 
l oc ati ons
 
and
 
addresses:
 
https://www.sanmar.com/resources/locationsshipping/warehouses
 
 
Shi p pi n g
 
Cu tof f
 
Times
 
 
This applies to o rders t hathav e been approv ed by o ur c redit departm ent and have bee n queued fo r 
pro ces sing
 
in
 
the
 
wareho use.
 
SanM ar
 
will
 
m ake
 
reaso nable
 
effo rts
 
to
 
ship
 
o rders
 
rece iv ed
 
befo re
 
the 
cuto ff
 
tim e
 
on
 
the
 
same
 
day .
 
Orders
 
rece iv ed
 
after
 
the
 
wareho use
 
cuto ff
 
tim e
 
will
 
be
 
shipped
 
o ut
 
the 
nex t 
business day.
 
 
Pl eas e
 
v is i t
 
our
 
w ebsi te
 
for
 
s hi ppi ng
 
c utoff
 
times:
 
htt ps :/ / w w w . s an m ar.c o m/ r es o urc es / s hip pi n g
-
c uto ff
-
times
 
 
Shi p pi n g
 
Fr ee
 
Fr ei gh t
 
Policy
 
 
v } ((˚„’ („˚ („˚]PZ } v } „ˆ˚„’ }À ˚„ ¨î ìì Xìì ’Z]›› À P„} µvˆ Á]v ›„˚(˚ „„ „„]˚„
within
 
the
 
co ntinental
 
United
 
State s,
 
ex cluding
 
bags
 
and
 
o v ersized
 
trav el
 
bags. 
Belo wareUP Sreso urces 
fo r estim ate dshipping c o sts basedo n UP S zo nes/ rate s:
 
 
UPS
 
S hi ppi ng
 
Rates:
 
htt ps :/ / w w w . ups . c o m/ us / e n / s up po rt/ s hip pi n g
-
s u p po rt/ s hip pi n g
-
c o s ts
-
rates. page
 
 
 
 
 


7
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
PSST
 
(Pack
 
S ep ar atel y.
 
S h i p
 
Together.)
 
 
v „[’
 
P SST
 
pro gram
 
is
 
a
 
co llabo ratio n
 
between
 
co ntract
 
deco rato rs
 
and
 
SanMar
 
to
 
o ffer
 
high
 
lev els 
o f serv ice to P ro mo tio nalPro ductD istributo rs.P SST Order Cutoff tim e is 1 pm  from y o ur prim ary  
warehouse.
 
 
Pl eas e N ote
: 
To ensureefficient pro ces singo fP SSTo rders, the ship
-
to addresson t heo rder sho uld be 
an
 
ex act
 
m atch
 
with
 
the
 
address
 
in
 
o ur
 
sy stem .
 
We
 
reco mmend
 
that
 
customers
 
wo rk
 
with
 
their
 
SanM ar 
acco untte am to co nfirm the P SST deco rato r address.This also allows usto co nfirm whet her t he 
deco rato r is aP SST appro ved deco rato r. Fo r mo re info rmatio n please v isit:  
https://www.sanmar.com/resources/decorator
-
solutions
 
 
San Mar
 
Stan d ar d
 
Shi p
 
Methods
 
 
Sh ip
 
Method
 
Descr iption
 
UPS
 
UPS
 
Sta n d ar d
 
Ground
 
UPS
 
2N D
 
DAY
 
2n d
 
b u s in es s
 
d ay
 
d eliv ery
 
en d
 
of
 
day
 
UPS
 
2N D
 
DAY
 
AM
 
2n d
 
b u s in ess
 
day
 
d eliv ery
 
10:30
 
am
 
UPS
 
3R D
 
DAY
 
3rd
 
b u s in ess
 
d ay
 
d eliv ery
 
en d
 
of
 
day
 
UPS
 
N E XT
 
DAY
 
N ext
 
d ay
 
d eliv ery
 
10:30
 
am
 
UPS
 
NEXT
 
DAY 
EA
 
N ext
 
b u s in es s
 
day
 
d eliv ery
 
8:0 0
 
am
 
UPS
 
NEXT
 
DAY
 
SV
 
UPS
 
n ext
 
d ay
 
d eliv ery
 
3: 00
 
pm
 
UPS 
SATURDAY
 
E xt en d s
 
b us in es s
 
d ay
 
calcu lat ion
 
to
 
in clud e
 
Saturdays
 
USPS
 
PP
 
Un ited
 
Sta tes
 
Po s ta l
 
Serv ice
 
P ar cel
 
Post
 
USPS
 
APP
 
USPS
 
Air
 
Pa rce l
 
Post
 
PSST
 
Pa ck
 
Sep ar at ely .
 
Sh ip
 
To g eth e r
 
program
 
TRUCK
 
Tru ck
 
carri er
 
s erv ice.
 
All
 
O rd er s
 
o v er
 
200
 
p o u n d s
 
s h ou ld
 
u s e
 
th e
 
Tru ck
 
s h ip
 
m eth o d .
 
Tru ck
 
carrier
 
s erv ic es
 
ar e
 
b as ed
 
on
 
th e
 
d es tin at ion
 
zip
 
code
 
 
San Mar
 
Pr omoStan d ar d s
 
Shi p
 
Methods
 
 
Sh ip
 
Method
 
Sh ip
 
M e th o d
 
Service
 
Descr iption
 
UPS
 
Ground
 
UPS
 
Sta n d ar d
 
Ground
 
UPS
 
2N D
 
DAY
 
2n d
 
b u s in es s
 
d ay
 
d eliv ery
 
en d
 
of
 
day
 
UPS
 
2N D
 
DAY
 
AM
 
2n d
 
b u s in ess
 
day
 
d eliv ery
 
10:30
 
am
 
UPS
 
3RD
 
DAY
 
3rd
 
b u s in ess
 
d ay
 
d eliv ery
 
en d
 
of
 
day
 
UPS
 
NEXT
 
DAY
 
N ext
 
d ay
 
d eliv ery
 
10:30
 
am
 
UPS
 
N E XT
 
DA Y
 
EA
 
N ext
 
b u s in es s
 
day
 
d eliv ery
 
8:0 0
 
am
 
UPS
 
N E XT
 
DA Y
 
SV
 
UPS
 
n ext
 
d ay
 
d eliv ery
 
3: 00
 
pm
 
UPS
 
SATURDAY
 
E xt en d s
 
b us in es s
 
d ay
 
calcu lat ion
 
to
 
in clud e
 
Saturdays
 
USPS
 
APP
 
USPS
 
Air
 
Pa rce l
 
Post
 
USPS
 
PP
 
Un ited
 
Sta tes
 
Po s ta l
 
Serv ic e
 
P ar cel
 
Post
 
PSST
 
PSST
 
Pa ck
 
Sep ar at ely .
 
Sh ip
 
To g eth e r
 
program
 


8
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
San Mar
 
W ar eh ou se
 
W il l
 
Cal l
 
Ship
 
Methods
 
 
If
 
y o u
 
wo uld
 
like
 
to
 
pick
 
up
 
y o ur
 
o rders,
 
please
 
use
 
o ne
 
of
 
the
 
fo llo wing
 
wareho use
 
co des
 
in
 
the
 
ship 
m et ho d
 
field to
 
indicate
 
the
 
lo catio n
 
of
 
where
 
y o u
 
will
 
be
 
picking
 
up
 
the
 
o rder.
 
Please
 
allow
 
at
 
least 
two
-
three ho urs fo ryo ur order to  be pro cessed.
 
 
 
*N ote* 
for
 
Wil l C all or der stopr oc es ss uc c es s full y,y our acc ountmustbec onfig ur edfor War ehous e 
S el ecti on.
 
 
Warehouse
 
Code
 
Warehouse
 
Number
 
Location
 
PRE
 
1
 
Seattle,
 
WA
 
CIN
 
2
 
Cincinnati,
 
OH
 
COP
 
3
 
Dallas,
 
TX
 
REN
 
4
 
Ren o ,
 
NV
 
NJE
 
5
 
Robbinsville,
 
NJ
 
JAC
 
6
 
Jacksonville,
 
FL
 
MSP
 
7
 
Minneapo lis,
 
MN
 
PHX
 
12
 
Phoenix,
 
AZ
 
VA1
 
31
 
Rich mond,VA
 
 
Web
 
S er v ic es
 
PO
 
Wil l
 
C all
 
Example
 
<shipMethod>
REN
</shipMethod>
 
 
 
Flat
 
Fil e
 
PO
 
Wil l
 
C al l
 
Exampl e
 
( C usti nfo. txt
 
file)
 
1 2 3 4 , S an m ar, 1 2 3
 
Tes t
 
St.,Vi salia, CA,93 292,
R EN
,, N,,,, W,
 


9
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
I n tegr ated
 
O r d eri n g
 
Shipp i n g
 
Options
 
 
Co ntact
 
the
 
SanMar
 
inte gratio ns
 
te am
 
and
 
let
 
us
 
know
 
which
 
inte gratio n
 
m et ho d
 
(FTP
 
or
 
Web
 
Service)  
and 
o rderingo ptio nyo u wo uld liketo use.
 
 
Option
 
1:
 
Warehouse
 
C ons olidation
 
(D efault
 
Integr ation
 
Ac c ount
 
Configuration)
 
 
All
 
o rders
 
are
 
inte nded
 
to ship
 
com pletely
 
o ut
 
of
 
the
 
clo sest
 
wareho use.
 
If
 
o ne
 
item
 
is
 
o ut
 
of
 
sto ck,
 
then 
the e ntireo rderwill be 
mov ed to the next  c lo sest wareho use until theo rder c anbe shipped from o ne 
wareho use.
 
If
 
the
 
o rder
 
canno t
 
be
 
shipped
 
co m plet e,
 
then
 
it
 
will
 
auto
-
split
 
into
 
multiple
 
o rders
 
from
 
the 
clo sestwareho useswheresto ck is av ailable.
 
 
This o ptio nm ay delay t he ship t im e fo r t heentire o rder depending o n t he distance o f t heclo sest 
wareho use
 
that
 
has
 
av ailability
 
fo r
 
all
 
item s
 
but
 
sav es
 
on
 
shipping
 
co sts
 
which
 
can
 
o ccur
 
from
 
shipping 
fro mm ultiplewareho uses.
 
 
Option
 
2:
 
Auto
-
sp lit
 
sh ipments
 
(Integr ation
 
Ac c ount
 
M odific ation
 
Required)
 
 
This o ptio n autom atically  ships e ach line item  fro m t he clo sest available warehouse.
 
Yo u c an use this 
o ptio n t o help e nsure thato rders are shipped as fastas po ssible, howev er, additio nal shipping c harges 
can
 
be
 
incurred
 
per
 
warehouse.
 
If
 
y o u
 
are
 
using
 
web
 
serv ices
 
to
 
place
 
y o ur
 
o rders,
 
then
 
we
 
recom mend 
using t he GetP reSubm itP Oserv ice to  c heck inve nto ry befo re t he useo f t he submitP Oo r 
P romo
S
tandards sendP Omet ho ds.
 
 
This o ptio nm ay c ause some o rders to  require 
m anualinte rv entio n if t here is no teno ugh pro duct to  
fulfill
 
the
 
quantity
 
o rdered
 
on
 
o ne
-
line
 
item s
 
at
 
o ne
 
wareho use.
 
In
 
this
 
case,
 
the
 
entire
 
o rder
 
will
 
be
 
put 
o n ho ld ino ur sy stem, andy o ur acco unt team w ill beno tifiedto m anually k ey
-
inthem issing line 
item(s).
 
 
Option
 
3:
 
Warehouse
 
Selec tion
 
(Integr ation
 
Ac c ount
 
M odific ation
 
Required)
 
*
Requir edforWillCall 
o
rderprocessing
*
 
 
The
 
custom er
 
subm its
 
the
 
wareho use
 
num ber
 
that
 
they
 
wo uld
 
like
 
to
 
ship
 
the
 
o rder
 
from
 
on
 
each
 
line 
item .
 
We
 
recomm end
 
that
 
y o u
 
kee p
 
track
 
of
 
o ur
 
invento ry
 
to
 
prev ent
 
delay s
 
in
 
y our
 
o rder
 
processing.
 
 
This
 
o ptio n
 
m ay
 
require
 
m anual
 
inte rv entio n
 
if
 
an
 
item
 
is
 
not
 
av ailable
 
in
 
the
 
chosen
 
wareho use.
 
In
 
this 
case
 
the
 
entire
 
o rder
 
will
 
be
 
put
 
on
 
ho ld
 
and
 
yo ur
 
acco unt
 
team
 
will
 
need
 
to
 
m anually
 
key
-
in
 
the
 
o rder. 
If y o uare co nsideringthiso ptio n, please co ntact t heSanM ar Inte gratio nTe am  to  discuss if t his is t he 
right o ptio n fo r yo u.
 


10
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
O r d er
 
Pr oc essin g
 
Information
 
 
To
 
set
 
up
 
yo ur
 
o rder
 
pro cessing,
 
we
 
will
 
need
 
the
 
below
 
info rm atio n.
 
P lease
 
be
 
adv ised
 
this
 
info rm atio n 
is hard c o ded in o ur sy stem and c anno t be changedo n an o rder
-
by
-
o rder basis:
 
 
Sa n M ar
 
A c c ou nt
 
Number :
 
Shi p pi ng
 
No ti fi c ati on
 
E m ai l
 
Addr ess :
 
Shipping
 
Label
 
Company
 
Name:
 
Sa n M ar .c o m
 
Username:
 
Shi p pi ng
 
Option:
 
Pay ment
 
Method
 
(N et
 
T erms
 
or
 
Las t
 
4
 
of
 
C r edi t
 
C ar d
 
on
 
File):
 
 
 
Pl eas e
 
N ote
:
 
If
 
y o u
 
are
 
currently
 
set
 
up
 
to
 
use
 
P ay
 
Invoices
 
on
 
sanm ar.co m
 
and
 
you
 
nee d
 
these
 
invo ices 
acce ssible aswe ll,then please use t he associatedsanm ar.co m usernam e.
 


11
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
I ntegra te d
 
Order
 
Testing
 
 
EDE V
 
T est
 
Verification
 
 
Oncey o u hav esubm itte dyo ur t esto rderto o urEDEVenv ironm ent, please em ailus y o ur t estP O 
num ber
 
and
 
we
 
will
 
rev iew
 
y o ur
 
subm itte d
 
info rm ation.
 
At
 
this
 
time,
 
y o u
 
can
 
rev iew
 
y o ur
 
ho lding
 
file
 
in 
y o ur
 
_E DEV/D o ne
 
fo lder.
 
The
 
Ho lding
 
file
 
shows
 
yo u
 
the
 
wareho use
 
num ber
 
and
 
pro duct
 
av ailability
 
fo r 
each line item .
 
In 
pro ductio n,o ncetheo rder reaches o urm ain sy stem yo u w ill rece iv e anem ail 
no tificatio n and shipping co nfirm atio n just like wheny o u place ano rderwiththe ac co unt team so ro n 
o ur website.
 
 
P lease
 
be
 
adv ised
 
that
 
o ur
 
test ing
 
env ironm ent
 
m ay
 
not
 
m atch
 
the
 
invento ry
 
and
 
pricing
 
in
 
o ur 
pro ductio nenv iro nm ent.
 
This env iro nment is used fo r t est ing and pro cess im prov em ent and m ay  
be unav ailable during internal update s fro m t im eto t im e.
 
 
We
 
recommend
 
using
 
the
 
following
 
style/color/sizes
 
for
 
your
 
test
 
order.
 
 
Uniqu e _Ke y
 
|
 
partId
 
Style
 
|
 
productid
 
Color
 
Size
 
538203
 
PC54
 
Gold
 
M
 
538205
 
PC54
 
Gold
 
XL
 
805562
 
DT6000
 
Black
 
S
 
708274
 
PC78H
 
Charcoal
 
L
 
132110 4
 
DT564
 
Black
 
L
 
118155
 
PC61
 
Navy
 
XL
 


12
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Pr od u cti on
 
Setup
 
 
Upo n
 
successful
 
te sting
 
in
 
o ur
 
ED EV
 
env iro nment,
 
we
 
will
 
request
 
a
 
date/ tim e
 
you
 
wo uld
 
like
 
to
 
go
 
live 
in o ur pro ductio nenv iro nm ent.We w ill also  request the belo wo rder pro cessing info rm atio n:
 
 
Shi p pi ng
 
No ti fi c ati on
 
E m ai l
 
Addr ess :
 
Sa n M ar .c o m
 
Username:
 
(If
 
yo u
 
are
 
currently
 
set
 
up
 
to
 
use
 
P ay
 
Inv o ices
 
on
 
sanm ar.co m
 
and
 
yo u
 
need
 
these
 
invo ices
 
accessible
 
as 
we ll, t hen please use t he asso ciate d sanm ar.com  usernam e.)
 
 
Int egr at e d
 
Or d er i n g
 
Shi ppi ng
 
Option:
 
(W are ho us e
 
Co ns o li d ati o n,
 
Auto
-
s pli t,
 
or
 
Wa re ho us e
 
Selectio n)
 
 
P ro ductio n set up c antake2 4
-
4 8  ho urs. Oncey o u areno tifiedthaty o ur acco unthas been set up ino ur 
›„} ˆµı]} v˚vÀ ]„} vuÇ} µ v„ vˆu ]ı ’u oo„ˆ ı}} µ} ˆµı]} v[ o˚’˚ [
fo lders
 
v ia
 
flat
 
file,
 
or
 
by
 
using
 
the
 
pro ductio n
 
standard
 
Subm itP O
 
WSD L,
 
or
 
the
 
P ro mo
S
tandards
 
sendP O 
WSDL.
 
 
In pro ductio n, o nce yo uro rder is proces sed and shipped yo u w ill rece iv e an em ail not ificatio n and 
shipping c o nfirm atio n just like when yo u place ano rder w ith t he acco untte am sor o no ur website.Yo u 
can
 
rev iew
 
yo ur
 
} „ˆ˚„[’
 
ho lding
 
file
 
in
 
the
 
} v˚[
 
fo lder
 
of
 
o ur
 
FTP
 
serv er.
 
The
 
ho lding
 
file
 
show s
 
y o u
 
the 
sty le, co lo r, size,wareho use num ber, and pro duct availability  for e ach line itemwith aY o r N flag.
 
 
Once
 
yo ur
 
first
 
sm all
 
liv e
 
o rder
 
is
 
subm itt ed,
 
we
 
will
 
v erify
 
the
 
o rder
 
fo r
 
co rrect ness.
 
If
 
successful,
 
y o u 
can st art subm itting yo urorders atyo ur co nv enience.
 
 
Dupl i c ate
 
Or der
 
Li ne
 
Consolidation:
 
Our
 
sy stem
 
co nfirm s
 
Inv ento ry
 
av ailability
 
on
 
a
 
per
 
line
 
basis.
 
Subm itting
 
m ultiple
 
lines
 
fo r
 
the
 
sam e
 
pro duct
 
can 
result
 
in
 
inventory
 
being
 
so urced
 
from
 
a
 
warehouse
 
with
 
insufficient
 
stock
 
to
 
cover
 
the
 
full
 
quantity
 
of
 
your
 
order. 
P lease
 
ensure
 
yo u
 
are
 
co nso lidating
 
duplicate
 
lines
 
into
 
o ne
 
line
 
with
 
a
 
to tal
 
quantity
 
rather
 
than
 
subm itting 
duplicate  linesto ensuretim ely  proces sing and deliv ery.
 
 
ExampleDetails.txtFile 
Duplicate
 
Lines
 
Data
: 
FX34689,1003,
10
,3
 
FX34689,1003,
10
,3
 
 
 
ExampleDetails.txtFile 
Consolidated
 
Lines
 
Data
: 
FX34689,1003,
20
,3
 


13
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
FTP
 
and
 
Web
 
Serv i c e
 
Order
 
I ntegra tio n:
 
File
 
P roce s sin g
 
Overview
 
 
FTP o rder integratio n co nsistso f creating and uplo ading 3  t ext  files (CustInfo ,D etails, Release) to o ur 
FTP
 
server.
 
Web
 
serv ice
 
o rder
 
inte gratio n
 
co nsists
 
of
 
subm itting
 
the
 
Subm itP O
 
XM L
 
schem a
 
thro ugh
 
o ur 
WSD L w hich is t henco nv erte d into  3 t ext  files and auto matically  uplo aded t o o ur FTP serv er. Allo rder 
(]o „˚u ]ıı˚ ˆ}˚’›˚ı ]À ˚˚o˚’˚[ oˆ˚„’ v} µ˚„À Z} µ„’
ho lding
 
file
 
(o rder
 
acknowledgement)
 
will
 
be
 
created
 
in
 
the
 
} oˆ]vP[
 
fo lder.
 
All
 
files
 
will
 
transitio n
 
to
 
the 
 } v (} oˆ} v˚ Z} „ˆ Z}˚’ ’˚ˆX
 
 
I n tegr ati on
 
O rd er
 
Fol d er
 
Details
 
 
In
 
&
 
Rel eas e
 
Fol der :
 
The
 
CustInfo .txt
 
and
 
D etails.txt
 
files
 
are
 
uplo aded
 
to
 
the
 
[
 
fo lder,
 
while
 
the 
˚XıÆ ı µ›o} ˆ}Z˚’˚ [ oˆ˚}˚’’]vPX
 
 
Done
 
Fol der :
 
Order
 
files
 
in
 
a
 
successful
 
o rder
 
will
 
be
 
mo ved
 
to
 
the
 
} v˚[
 
fo lder.
 
The
 
o rder
 
will
 
then
 
be 
entere d into o urm ain sy stem where itwill besenttothe w areho use
.
 
 
Hol di ng
 
and
 
Wai ti ng
 
Rel eas e
 
Fol der :
 
Upo n
 
subm ission
 
of
 
yo ur
 
inte gratio n
 
o rder
 
the
 
Ho lding.txt
 
file
 
will 
 „˚ı˚ ˆ} oˆ]vP oˆ Z]’}ÁZ]Z ˆµı’ À ]ovˆ Z Á„˚Z} µ’
number.
 
 
If
 
y o u
 
do
 
no t
 
uplo ad
 
the
 
release
 
file,
 
then
 
the
 
o rder
 
will
 
no t
 
be
 
pro cessed.
 
The
 
Ho lding
 
file
 
will
 
still
 
be 
create d, howev erthe 
v(} XıÆı˚ı ]o’XıÆ (]o˚’u} À} Z˚ ]ı]vP [ oˆ˚„X
 
 
Er r or Fi l es
 
Fol der :
 
If
 
there
 
is
 
an
 
issue
 
with
 
the
 
fo rm at
 
or
 
data
 
of
 
y o ur
 
o rder
 
files
 
then
 
they
 
will
 
be
 
mo ved 
ı} „„}]o˚’} oˆ˚„X
 
 
Resu b mi tted Fi l es Fol d er:
 
If the 
file nam e fo r a submitte d integratio n o rder hasprev io usly  been 
pro ces sed,
 
o ur
 
sy stem
 
will
 
m ov e
 
all
 
files
 
to
 
the
 
Zu ]ıı]o˚’[
 
fo lder.
 
The
 
files
 
in
 
this
 
fo lder
 
will
 
not 
be pro cesse d.
 
 
FTP
 
Fol der
 
S et
 
Example
 
 


14
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanMar
 
Standar d
 
T ex t
 
File
 
Order
 
Integration
 
 
The
 
fo llowing
 
info rm atio n
 
o utlines
 
the
 
required
 
fields
 
in
 
each
 
file.
 
We
 
prov ide
 
sam ple
 
o rdering
 
files 
within t he Integratio n Info rm atio n fo ldero n o ur FTP serv er.
 
 
Text
 
file
 
o rder
 
integratio n
 
thro ugh
 
o ur
 
FTP
 
serv er
 
requires
 
the
 
creatio n
 
of
 
three
 
comm a
-
delim ite d
 
ASCII 
te xt files: 
C usti nfo. txt
, 
Detai l s. txt
, 
and R el eas e. txt
.
 
The o rder 
file nam esm ust be capitalized
. Befo re 
y o u
 
start
 
creating
 
the
 
inte gratio n
 
o rder
 
files,
 
yo u
 
m ust
 
underst and
 
ho w
 
to
 
appro priate ly
 
fo rm at
 
the
 
file 
nam es, as purchase ordersare asso ciated by file nam e.
 
 
File
 
nam es
 
are
 
det erm ined
 
by
 
the fo llo wing
 
m ain
 
components
:
 
1.
 
The 
or der
 
name
.This entry c an co ntain alphanumericcharacters and dashes.
 
Each se to fP Oo rder names 
m ust be unique.
 
SanM arRecomm ends using t he fo llowing 
date /  batc h number
 
fo rmat fo r t he 
or der  
name
: 
 
{
 
The
 
current
 
date
 
(
SanMarrecommends 
the
 
dateformat
 
shouldalways
 
beinthefollowingformat:
 
MM
-
DD
-
Y
YY
Y)
 
{
 
The
 
batc h
 
number
 
(an
 
incremental
 
num ber
 
m arking
 
the
 
num ber
 
of
 
purchase
 
o rders
 
sent
 
ov er 
each day)
 
2.
 
The
 
fil e
 
name
 
(Exam ple:
 
CustInfo .txt,
 
D etails.txt,
 
Release.tx t) .
 
Theo rder 
file nam es m ust be 
capitalized
 
 
Examples
:
 
06
-
07
-
2022
-
1CustInfo.txt 
06
-
07
-
2022
-
1Details.txt 
06
-
07
-
2022
-
1Release.txt
 
 
Date
 
B atc h
 
Number
 
File
 
Name
 
06
-
07
-
2022
 
-
1
 
CustInfo.txt
 
06
-
07
-
2022
 
-
1
 
Details.txt
 
06
-
07
-
2022
 
-
1
 
Release.txt
 
 
T ext
 
Fil e
 
Date /
 
Batc h
 
Name
 
Formatting
 
 
M ultipleo rders w ill need to  be batched inthe file 
nam ing fo r all3  files. Fo rex am ple,the first 
(} XıÆ (]o} vv ó Uì îî vu^ìò
-
07
-
20 22
-
í(} XıÆı_Z ^
-
í _} Z
filenam e
 
represents
 
the
 
first
 
o rder.
 
The
 
seco nd
 
o rder
 
will
 
be
 
nam ed
 
^ìò
-
07
-
20 22
-
î(} XıÆı_ U
 
and
 
so  
o n. The batch num ber is an increm ental num berm arking t he num ber o f purchase o rder batches se nt 
} À ˚ ıµu  (} Z (} oo}Á]vP’ı„ıÀ^ í U_’}ıZ (]„ (]o (}v ô
î ìî î U} µoˆ^ ìò
-
08
-
20 22
-
í(} XıÆıX_
 
 
 
T ext
 
O rd er
 
Fil es
 
Sub mi ssi on
 
T i mi n g
 
Recommendations
 
 
To  avo id t im ing e rro rs resulting in failed proces sing, please ensurey o usubm it a co m plet e se t o f CustInfo and 
D et ails
 
files
 
befo re
 
subm itting
 
the
 
co rrespo nding
 
Release
 
file.
 
We
 
reco mmend
 
adding
 
a
 
tim ing
 
delay
 
of
 
sev eral 
sec o nds at  least  befo re subm ittingthe Release file.
 


15
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Detail s. txt
 
Fi l e
 
Formatting
 
 
The Det ails.txt  file co ntains t he pro duct info rm atio n for a give n purchaseo rder.Two o fthe fields 
(INVENTO RY_KEY
 
and
 
SIZE_IND EX )
 
are
 
directly
 
so urced
 
from
 
the
 
SanMar
 
Extended
 
P ro duct
 
D esc ripto r 
D atabase (Sanm ar_EPD D .csv  file).
 
 
As the CustInfo .txt and t heD et ails.tx tto get herco nstitute  yo ur e lect ro nic purchase o rder (CustInfo .txt 
co ntaining t he shipping info rmatio n and Det ails.txt containing t he pro duct info rm atio n), the two files 
should
 
alway s
 
m atch
 
in
 
te rm s
 
of
 
date
 
and
 
batch
 
num ber.
 
So ,
 
alo ng
 
with
 
the
 
first
 
CustInfo .txt
 
file
 
on
 
June 
7 , 202 2 ,there w ill also  be a D etails.tx t file,co rrespo ndingly nam ed 
^ì ò
-
07
-
2 02 2
-
í ˚ı ]o’XıÆ ı_
(} XıÆ (]o} v Z ’u ˆı’}  } „„˚’›} vˆ˚vı˚ı ]o’XıÆı]o vu^ ìò
-
07
-
 
2 02 2
-
î˚ı ]o’XıÆıU_}} vX
 
 
Pl eas e
 
N ote
:
 
The
 
INVENTORY_ KEY
 
required
 
in
 
the
 
Details.txt
 
file,
 
is
 
no t
 
the
 
sam e
 
num ber
 
as
 
o ur
 
sty le 
num ber used in o urcatalo g o ro nlineo ffering.
 
 
Detai l s. txt
 
Fil e
 
Fiel d
 
Descriptions
 
 
 
Fie ld
 
Name
 
Fie ld
 
Description
 
Ch ar
 
Max
 
Data
 
Type
 
Required
 
PONUM
 
Pu rch as e
 
Ord er
 
N u mb er
 
fo r
 
y o u r
 
order
 
28
 
VARCHAR
 
Y
 
INVENTORY_KEY
 
San Ma r
 
Pro d u ct
 
Identifier
 
6
 
INT
 
Y
 
QTY
 
It em
 
Quantity
 
5
 
INT
 
Y
 
SIZE_INDEX
 
Pro d u ct
 
Size
 
Identifier
 
11
 
INT
 
Y
 
WHSE_N O
 
*
Warehouse
 
Numb er
 
(
Le ave
 
B lank
)
 
2
 
INT
 
N
 
 
*
 
D ue
 
to
 
the
 
need
 
to
 
v erify
 
sto ck
 
in
 
the
 
subm itte d
 
wareho use
 
befo re
 
placing
 
y o ur
 
o rder,
 
please
 
co ntact 
the 
SanM ar Inte gratio n Team  to  discuss if this is the right o ptio n fo r yo u.
 
 
PON UM
 
INVENTORY_KEY
 
QTY
 
SIZE_IN DEX
 
WHSE
 
NO
 
FX34689
 
1003
 
10
 
3
 
Leave
 
Blank
 
 
Example
 
Details.txt
 
File
 
Data
: 
FX34689,1003,10,3
 


16
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
C us tI nfo. txt
 
Fi l e
 
Formatting
 
 
PleaseNote: 
DoNotUse
 
Additional
 
Commasin 
anyFi eld
 
DuetotheCommabeingourDelimiterinorder 
files.
 
 
The
 
CustInfo.txt
 
file
 
contains
 
the
 
shipping
 
information
 
for
 
a
 
purchase
 
order.
 
 
C us tI nfo. txt
 
Fil e
 
Field
 
Descriptions
 
 
Fie ld
 
Name
 
Fie ld
 
De scription
 
Ch ar
 
Lim it
 
Type
 
Required
 
PONUM
 
Purchase
 
OrderNumb er for
 
your
 
order
 
28
 
VARCHAR
 
Y
 
Ship
-
to
 
Address 
Field  1
 
Sh ip
 
to
 
Ad d res s .
 
Pleas e
 
u s e
 
thes e  
s treet
 
ab b rev iat ion s :
 
ST,
 
AVE ,
 
RD, 
DR,
 
BLVD
 
35
 
VARCHAR
 
Y
 
Ship
-
to
 
Address
 
Field
 
2
 
Us ed
 
fo r
 
th e
 
Su ite
 
or
 
AP T
 
#
 
35
 
VARCHAR
 
N
 
Ship
-
to
 
City 
Name
 
Sh ip
 
to
 
City
 
28
 
VARCHAR
 
Y
 
Ship
-
to
 
State
 
Name
 
Sh ip
 
to
 
State
 
2
 
VARCHAR
 
Y
 
Sh ip
-
to
 
Zip
 
Code
 
Sh ip
 
to
 
Zip
 
Cod e.
 
5
 
d igits
 
or
 
5
 
d igits
-
4 
d igits . E xa mp les : 00885 o r 98 007
-
 
1156
 
or980071156
 
Valid  Fo rmat s :
 
XXXXX
-
XX XX
 
XXXXX
 
XXXXX XXXX
 
5
-
10
 
Min
 
5
 
Cha rs .
 
Add
 
Precedin g
 
Zeros
 
if 
need ed.
 
VARCHAR
 
(Numb ersOnly )
 
Y
 
Shipping
 
Method
 
Shipping
 
Method.
 
Examples :
 
UPS
 
or
 
USPS
 
15
 
VARCHAR
 
Y
 
Ship
-
to
 
Email
 
E
-
mail
 
Address
 
for
 
Shipping 
Notification
 
105
 
VARCHAR
 
Y
 
Resid ence
 
Des igna tes
 
if
 
th e
 
loca tio n
 
is
 
a
 
res id en ce.
 
E xa mp l e:
 
Y
 
or
 
N
 
1
 
VARCHAR
 
Y
 
Department
 
/Office 
Code
 
Leave
 
Blank
 
6
 
VARCHAR
 
N
 
Notes
 
Leave
 
Blank
 
54
 
VARCHAR
 
N
 
Ship
-
to
 
Company
 
Name
 
Sh ip
 
to
 
Comp an y
 
Name
 
28
 
VARCHAR
 
N
 
Integration
 
Method
 
Leave
 
Blank
 
1
 
VARCHAR
 
N
 
Ship
-
to 
Attention
 
Us er
 
fo r
 
th e
 
„˚ ˚]À ˚„[ ’
 
n ame
 
or
 
PO 
number
 
35
 
VARCHAR
 
N
 
 
PONUM
 
ADDRESS_1
 
ADDRESS_2
 
CITY
 
STATE
 
ZIP_CODE
 
SHIP_METHOD
 
SHIP_TO_EMAIL
 
RESIDENCE
 
DEPT
 
NOTES
 
CO
 
NAME
 
INT_METHOD
 
ATTENTION
 
FX3469
 
123
 
GRIFFITH
 
ST
 
ST E
 
202
 
CHARLOTTE
 
NC
 
28217
 
UPS
 
sales@abco.com
 
N
 
 
 
My
 
Decorator
 
 
DANA
 
 
Exa m pl e
 
C us tI nf o.t x t
 
fi l e
 
Data
 
FX34689,123
 
GRIFFITH
 
ST,STE
 
202,CHARLOTTE,NC,28217,UPS,sales@abco.com,N,,,My
 
Decorator,,DANA
 


17
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Rel ease.t xt
 
Fi l e
 
Formatting
 
 
The
 
Release.txt
 
is
 
the
 
authorizatio n
 
file
 
that
 
releases
 
the
 
CustInfo .txt
 
and
 
D etails.txt
 
files
 
fo r
 
pro cessing 
and fulfillm ent.
 
 
A 
purchaseo rderwill not be pro cesse d until a releasefile withthe co rrespo nding purchaseo rder 
num ber
 
is
 
sent
 
fo r
 
release .
 
A
 
purchase
 
o rder
 
can
 
be
 
release d
 
fo r
 
pro cessing
 
up
 
to
 
two
 
we eks
 
after
 
a 
particular pairo f CustInfo .txt  and Det ails.txt  files hav e bee n subm itted. P ro duct av ailability will be 
det erm ined w hen the purchase o rder is released andpro ces sed.
 
 
Nam e
 
fo rm atting
 
fo r
 
the
 
Release .tx t
 
file
 
is
 
the
 
same
 
as
 
the
 
D etails
 
and
 
CustInfo
 
files
 
with
 
the
 
additio n
 
o f 
the re lease  num berwhich is added to  t he e ndo f t he file descriptio n. This is added t o  distinguish t he 
num bero f release s autho rized e ach day . Because any give n pairo f CustInfo .txt and D et ails.tx t files can 
refere ncem o re thano ne purchase order, the r
eleasefile allows the flexibility toautho rize fo r 
pro ces sing any o neo r combinatio n o f m ultiple purchase orders inthe CustInfo .txt and Det ails.txt p
air 
batch.
 
 
Example
:  Ifa pairo f CustInfo .txt and Det ails.txt  files refe rences three  purchaseorders fo r t hree 
ˆ](( ›„} ˆµı’ı o˚’ (]o˚ v} vvó U ìî î vu^ ìò
-
07
-
22
-
í˚í XıÆı _u Ç
autho rizeo nly
 
two o f
 
the purchase orders
 
fo r
 
pro ces sing
 
and
 
shipment. T he third
 
purchaseo rder
 
co uld 
be
 
released
 
later
 
in
 
the
 
day
 
or
 
up
 
two
 
week s
 
later,
 
and
 
wo uld
 
be
 
nam ed
 
^ì ò
-
07
-
22
-
í’˚î XıÆı U_
 
since 
it wo uld be the seco nd release autho rizatio nfo rthe pair o f CustInfo .txt  andD etails.txt  files placedo n 
June 7 ,2 02 2 .
 
 
Release.txt
 
File
 
Field
 
Descriptions
 
 
Fie ld
 
Name
 
Fie ld
 
De scription
 
Ch ar
 
Limit
 
Type
 
Required
 
PO
 
Numb er
 
Pu rch as e
 
Ord er
 
N u mb er
 
fo r
 
y o u r
 
order
 
28
 
VARCHAR
 
Y
 
 
PON UM
 
FX34689
 
 
Exa m pl e
 
R el e as e. t xt
 
Fi l e
 
Data
 
FX34689
 


18
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Hol d in g. tx t
 
Fil e
 
(Ord er
 
Acknowledgement)
 
 
The Ho lding.txt fileserv esas yo ur order acknowledgem ent fo r yo ur 
inte gratio n purchase order. It is 
pro duced w ithin 15 m inutes aft er yo u subm it yo uro rder. T he pro cessor co nverts the det ails data 
(Inv ento ry
 
Key
 
and
 
Size
 
Index )
 
into
 
the
 
ho lding
 
file
 
as
 
sty le,
 
co lo r,
 
and
 
size.
 
The
 
ho lding
 
file
 
also
 
displays 
the s hip
-
from wareho use and pro duct av ailability flag(Y  or N)which t ells yo u ifthere is stock fo rthe 
subm itted line item .
 
 
SanM ar willcheck invento ry  prio r to  placing ano rderand w ill so urceeacho rderfro m t he c losest 
wareho use to the destinatio n zip co de. If t he invento ry  is unav ailable, a SanM arcustom erserv ice 
represe ntative
 
will
 
no tify
 
the
 
custom er
 
v ia
 
pho ne
 
fo r
 
perm issio n
 
to
 
ship
 
short
 
or
 
find
 
an
 
alternate
 
item 
to  replacetheo ut
-
of
-
sto ckinv ento ry.
 
 
Hol di ng. txt
 
Fil e
 
Field
 
Descriptions
 
 
Fie ld
 
Name
 
Fie ld
 
De scription
 
Ch ar
 
Limit
 
Type
 
PO
 
Numb er
 
Purchase
 
Ord er
 
Numb er
 
fo r
 
y o u r
 
order
 
28
 
VARCHAR
 
Style
 
Sty le
 
numb er
 
10
 
VARCHAR
 
Color
 
Sty le
 
Co lor
 
14
 
VARCHAR
 
Quantity
 
It em
 
Quantity
 
Implied
 
INT
 
Warehous e
 
Numb er
 
Ship
-
Fro m
 
Warehouse
 
number
 
Implied
 
INT
 
Availability
 
Sto ck
 
Av aila b ility .
 
Y
 
or
 
N
 
1
 
VARCHAR
 
 
PON UM
 
Style
 
Color
 
Size
 
QTY
 
WHSE_NO
 
Availab ility
 
FX34689
 
363B
 
White
 
S
 
10
 
2
 
Y
 
 
Exa m pl e
 
H ol di ng.t x t
 
data
 
FX34689,363B,White,S,10,2,Y
 
 
W ar eh o us e
 
N u mer i c
 
Val ues
 
All
 
wareho uses
 
are
 
assigned
 
a
 
num ber
 
which
 
is
 
displayed
 
in
 
the
 
o rder
 
inte gratio n
 
ho lding
 
file.
 
 
Warehouse
 
Code
 
Warehouse
 
Number
 
Location
 
PRE
 
1
 
Seattle,
 
WA
 
CIN
 
2
 
Cincinnati,
 
OH
 
COP
 
3
 
Dallas,
 
TX
 
REN
 
4
 
Ren o ,
 
NV
 
NJE
 
5
 
Robbinsville,
 
NJ
 
JAC
 
6
 
Jacksonville,
 
FL
 
MSP
 
7
 
Minneapo lis,
 
MN
 
PHX
 
12
 
Phoenix,
 
AZ
 
VA1
 
31
 
Rich mond,VA
 


19
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanMar
 
Stan dard
 
Web
 
Serv ices
 
Orde r
 
Integration
 
 
Order
 
proces sing
 
set up
 
in
 
bo th
 
in
 
bo th
 
o ur
 
ED EV
 
and
 
pro ductio n
 
env ironm ents
 
can
 
take
 
24
-
48
 
hours.
 
 
EDEV:
 
htt ps: // edev
-
ws.sanmar.com:8080/SanMarWebService/SanMarPOServicePort?wsdl
 
PRODUCTI ON:
 
https:/ /ws.sanm ar.co m: 80 80/ SanM arWe bServ ice/ SanM arP OServ iceP ort?wsdl 
There are two functio ns available fo r t hiswe b serv ice:
 
getPreSubmitInfo 
SubmitPO
 


20
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Sa nM a r
 
g et P r eSu b mi tIn f o
 
Service
 
 
PleaseNote: 
DoNotUse
 
Additional
 
Commasin 
anyFi eldDuetotheCommabeingourDelimiterinorder 
files.
 
 
This serv ice re turnsam essage co nfirm ing t he av ailability o f invento ry from  t he clo sest wareho use 
lo catio n based o nthe dro pship lo catio n ( State ) and does not subm it the o rder. Ifsto ck isco nfirm ed 
fro m
 
the
 
clo sest
 
wareho use,
 
the
 
m essage
 
and
 
the
 
wh
s
eNo
 
is
 
returned
 
in
 
webServicePODet ail
-
L ist
 
of
 
the 
„˚’›} v’˚ (} oo}Á’Wµ˚’ıvı]ıÇ } v(]„u ˚ˆ ]o
wareho use [whseNo] to ship t o 
Ç } µ˚’ı ]vı]} vX_} l v}À ]oo˚uvÇÁ„˚Z} µ’˚Uu ˚’’P„˚ıµ„v Z
Á˚ À ]˚ ˚ı ]o ]’ı ’›} v} oo}Á’W˚‰µ˚’ıvı]ıÇ v} ]v } („}u
wareho useo r from  re quested w areho us
˚_ X
 
 
SanM ar
 
getPr eSubmitInfo
 
Ser vic e
 
Request
 
Parameters
 
 
Pl eas e
 
N ote
:
 
Each
 
PO
 
submission
 
can
 
co ntain
 
m ultiple
 
line
 
item s.
 
Each
 
line
 
item
 
must
 
include
 
both 
inv ento ryKey and sizeIndex, 
or
 
sty le, co lo r, and size.
 
 
Fie ld
 
Name
 
Fie ld
 
De scription
 
Ch ar
 
Limit
 
Type
 
Required
 
attention
 
˚ ]À ˚„[ ’
 
N ame
 
or
 
PO
 
numb er
 
35
 
VARCHAR
 
N
 
internalMessage
 
Leave
 
Blank
 
 
VARCHAR
 
N
 
notes
 
Leave
 
Blank
 
54
 
VARCHAR
 
N
 
poNum
 
PO
 
Numb er
 
28
 
VARCHAR
 
Y
 
poSend erId
 
Leave
 
Blank
 
12
 
VARCHAR
 
N
 
residen ce
 
Y
 
or
 
N
 
( Yes
 
or
 
No)
 
1
 
VARCHAR
 
Y
 
department
 
Leave
 
Blank
 
6
 
VARCHAR
 
N
 
shipAddress1
 
Ship
-
to
 
Company
 
Address.
 
Us e
 
the
 
following
 
street
 
ab b rev iat ion s :
 
ST,
 
AVE ,
 
RD,
 
DR,
 
BLVD
 
35
 
VARCHAR
 
Y
 
shipAddress2
 
Su ite
 
or
 
Apt#
 
35
 
VARCHAR
 
N
 
shipCity
 
Sh ip
-
to
 
City
 
Name
 
28
 
VARCHAR
 
Y
 
shipEmail
 
Drop
 
Sh ip
 
E mail
 
address
 
105
 
VARCHAR
 
Y
 
shipMethod
 
E x:
 
UPS
 
15
 
VARCHAR
 
Y
 
shipState
 
Sh ip
-
to
 
Sta te
 
Name
 
2
 
VARCHAR
 
Y
 
shipTo
 
Ship
-
to
 
Co mpany
 
Name
 
28
 
VARCHAR
 
N
 
shipZip
 
Sh ip
-
to
 
ZIP
 
Cod e.
 
5
 
d igits
 
or
 
5
 
d igits
-
4
 
digits.
 
Ad d
 
Preced in g
 
Z ero s ,
 
if
 
n eed e d .
 
E x:
 
0080 54
 
or
 
98007
-
115 6
 
o r 9800 7115 6
 
5
 
-
 
10
 
Numbers. 
Min
 
5
 
Cha rs
 
 
VARCHAR
 
 
Y
 
color
 
Pro d u ct Color.  E x: Black.  (Mu s t u s e t h e 
SANM AR _MAIN FR AME _C OLO R d at a.  This  ca n  b e 
retriev ed  fro m t h e Sa n mar _S DL_N.CS V fil e o n  o u r
 
FTP
 
s erv er,
 
or
 
th ro u gh
 
th e
 
San Ma r
 
Dat a
 
Lib ra ry
 
file 
on
 
San Ma r.co m)
 
50
 
VARCHAR
 
Y
 
errorOccured
 
Leave
 
Blank
 
 
 
N
 
inventoryKey
 
20828
 
10
 
INT
 
Y
 
message
 
Leave
 
Blank
 
 
VARCHAR
 
N
 
poId
 
Leave
 
Blank
 
11
 
VARCHAR
 
N
 
quantity
 
N u mb er
 
of
 
Pro d u cts
 
o rd ered
 
EX:12
 
6
 
INT
 
Y
 
size
 
Pro d u ct
 
SIZE
 
-
 
E x:
 
XL
 
50
 
VARCHAR
 
Y
 
sizeIndex
 
5
 
11
 
INT
 
Y
 
style
 
E x:
 
K500
 
60
 
VARCHAR
 
Y
 
*whs eNo
 
Leave
 
Blank.
 
10
 
INT
 
N
 


21
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
 
* Wareho use selectio n requires a mo dificatio n
 
to yo ur inte gratio n o rder proces sing, and yo u
 
will need 
to
 
utilize
 
the invento ry
 
web
 
serv ice befo re
 
placing
 
o rders.
 
P lease
 
co ntact
 
the
 
SanM ar
 
Inte gratio n
 
Team 
to  discuss using t hiso ptio n.
 
 
SanM ar
 
getP r eSubmitInfo
 
Ser vic e
 
XM L
 
Request:
 
 
<soapenv:Envelope xmlns:soapenv
="http://schemas.xmlsoap.org/soap/envelope/" 
xmlns:web="http://webservice.integration.sanmar.com/">
 
  
<soapenv:Header />
 
  
<soapenv:Body>
 
    
<web:getPreSubmitInfo>
 
      
<arg0>
 
        
<attention>SanMar Integrations</attention>
 
        
<internalMessage>?</internalMessage>
 
        
<notes>?</notes>
 
        
<poNum>WEBSERVICES TEST</poNum>
 
        
<poSenderId>?</poSenderId>
 
        
<residence>N</residence>
 
        
<department>?</department>
 
        
<shipAddress1>22833 SE Black Nugget Rd</shipAddress1>
 
        
<shipAddress2>STE 130</shipAddress2>
 
        
<shipCity>Issaquah</shipCity>
 
        
<shipEmail>sanmarintegrations@sanmar.com</shipEmail>
 
        
<shipMethod>UPS</shipMethod>
 
        
<shipState>WA</shipState>
 
        
<shipTo>SanMar Corporation</shipTo>
 
        
<shipZip>98029</shipZip>
 
        
<webServicePoDetailList><!
--
Zero or more repetitions:
--
>
 
          
<color>white</color>
 
          
<errorOccured>?</errorOccured>
 
          
<inventoryKey />
 
          
<message>?</message>
 
          
<poId>?</poId>
 
          
<quantity>5</quantity>
 
          
<size>m</size>
 
          
<sizeIndex />
 
          
<style>K500</style>
 
          
<whseNo>?</whseNo>
 
        
</webServicePoDetailList>
 
      
</arg0>
 
      
<arg1>
 
        
<sanMarCustomerNumber>
12345
</sanMarCustomerNumber>
 
        
<sanMarUserName>YourSanmar.comUsername</sanMarUserName>
 
        
<sanMarUserPassword>YourSanMar.comPassword</sanMarUserPassword>
 
      
</arg1>
 
    
</
web:getPreSubmitInfo>
 
  
</soapenv:Body>
 
</soapenv:Envelope>


22
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanM ar
 
getP r eSubmitInfo
 
Ser vic e
 
XM L
 
Resp onse
 
Scenar io
 
1 
-
 
Inventor y
 
is
 
available.
 
 
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
 
  
<S:Body>
 
    
<ns2:getPreSubmitInfoResponse
 
    
xmlns:ns2="http://webservice.integration.sanmar.com/">
 
      
<return>
 
        
<errorOccurred>false</errorOccurred>
 
        
<message>Information returned successfully</message>
 
        
<response xmlns:xsi="http://www.w3.org/2001/XMLSchema
-
instance" 
 
        
xsi:type="ns2:webServicePO">
 
          
<attention>SanMar Integrations</attention>
 
          
<department>?</department>
 
          
<internalMessage>SUCCESS: Inventory Found</internalMessage>
 
          
<notes>?</notes>
 
          
<poNum>WEBSERVICES TEST</poNum>
 
          
<residence>N</residence>
 
          
<shipAddress1>22833 SE Black Nugget Rd</shipAddress1>
 
          
<shipAddress2>STE 130</shipAddress2>
 
          
<shipCity>Issaquah</shipCity>
 
          
<shipEmail>sanmarintegrations@sanmar.com</shipEmail>
 
          
<shipMethod>UPS</shipMethod>
 
          
<shipState>WA</shipState>
 
          
<shipTo>SanMar Corporation</shipTo>
 
          
<shipZip>98029</shipZip>
 
          
<webServicePoDetailList>
 
            
<color>white</color>
 
            
<errorOccured>false</errorOccured>
 
            
<inventoryKey>20860</inventoryKey>
 
            
<message>Requested Quantity is confirmed and available in
 
             
warehouse '1' to ship to your destination.</message>
 
            
<quantity>5</quantity>
 
            
<size>m</size>
 
            
<sizeIndex>3</sizeIndex>
 
            
<style>K500</style>
 
            
<whseNo>1</whseNo>
 
          
</webServicePoDetailList>
 
        
</response>
 
      
</return>
 
    
</ns2:getPreSubmitInfoResponse>
 
  
</S:Body>
 
</S:Envelope>


23
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanM ar
 
getP r eSubmitInfo
 
Ser vic e
 
Resp onse
 
Scenar io
 
2
 
-
 
Inventor y
 
is
 
not
 
available.
 
 
<S:Envel ope xm lns:S = "http:// schema s.xml s oap.org/ soap/e nvelo p e/">
 
  
<S:Body>
 
    
<ns2:getPreSubmi tInfoResponse
 
    
xmlns:ns2="http: //webservice.integra tion.sanmar.com/">
 
      
<return>
 
        
<errorOccurr ed>true</errorOccurr ed>
 
        
<message>Req uestedQuantityis n otinstockfromany warehouseor from 
 
        
therequeste dwarehouseforthe followingstyles:[( K420,900)]</message>
 
        
<responsexm lns:xsi="http://www. w3.org/2001/XMLSchem a
-
instance" 
 
        
xsi:type="ns 2:webServicePO">
 
          
<internalM essage>RequestedQua ntityisnotinstoc kfromany 
 
          
warehouse orfrom therequeste dwarehouseforthe 
 
          
following styles: [(K420,900)] </internalMessage>
 
          
<notes>?</ notes>
 
          
<poNum>WEB SERVICES
-
TEST</poNum >
 
          
<poSenderI d>0</poSenderId>
 
          
<residence >N</residence>
 
          
<shipAddre ss1>22833SEBlack N uggetRd</shipAddres s1>
 
          
<shipAddre ss2>Ste 130</shipAdd ress2>
 
          
<shipCity> Issaquah</shipCity>
 
          
<shipEmail >noemail@sanmar.com< /shipEmail>
 
          
<shipMetho d>UPS</shipMethod>
 
          
<shipState >WA</shipState>
 
          
<shipTo>Sa nMarCorporationInc .</shipTo>
 
          
<shipZip>9 8029</shipZip>
 
          
<webServic ePoDetailList>
 
            
<color>B lack</color>
 
            
<errorOc cured>true</errorOcc ured>
 
            
<invento ryKey>9203</inventor yKey>
 
            
<quantit y>900</quantity>
 
            
<size>S< /size>
 
            
<message >RequestedQuantity isnotinstockfrom anywarehouseor 
 
            
fromreq uestedwarehouse</me ssage>
 
            
<sizeInd ex>2</sizeIndex>
 
            
<style>K 420</style>
 
          
</webServi cePoDetailList>
 
        
</response>
 
      
</return>
 
    
</ns2:getPreSubm itInfoResponse>
 
  
</S:Body>
 
</
S:Envelope>


24
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanMar
 
Stan dard
 
s ubmitPO
 
Serv ice
 
PleaseNote: 
DoNotUse
 
Additional
 
Commasin 
anyFi eldDuetotheCommabeingourDelimiterinorder 
files.
 
 
This serv ice subm its a purchase o rder to  SanM ar fo r pro cessing. EachP O subm issio n c an co ntain 
m ultiple line item s.Each line item m ust include an invento ry Key  and sizeIndex ,or st y le, co lo r 
(SANM AR_M AINFRAM E_COL OR),
 
and
 
size.
 
We
 
recomm end
 
using
 
the
 
inv ento ryKey
 
and
 
sizeIndex
 
to  
reduce pro ces singerrors.
 
 
San Mar
 
Stan d ar d
 
su b mitPO
 
Ser vic e
 
Req u est
 
Parameters
 
 
Fie ld
 
Name
 
Fie ld
 
De scription
 
Ch ar
 
Limit
 
Type
 
Required
 
attention
 
˚ ]À ˚„[ ’
 
N ame
 
or
 
PO
 
numb er
 
35
 
VARCHAR
 
N
 
internalMessage
 
Leave
 
Blank
 
 
VARCHAR
 
N
 
notes
 
Leave
 
Blank
 
54
 
VARCHAR
 
N
 
poNum
 
PO
 
Numb er
 
28
 
VARCHAR
 
Y
 
poSend erId
 
Leave
 
Blank
 
12
 
VARCHAR
 
N
 
residen ce
 
Y
 
or
 
N
 
( Yes
 
or
 
No)
 
1
 
VARCHAR
 
Y
 
department
 
Leave
 
Blank
 
6
 
VARCHAR
 
N
 
shipAddress1
 
Sh ip
-
to
 
Comp an y
 
Ad d res s .
 
Us e
 
th e
 
fo llo win g
 
s tre et 
ab b rev iat ion s : ST,  AVE ,  RD,  DR,  BLVD
 
35
 
VARCHAR
 
Y
 
shipAddress2
 
Su ite
 
or
 
Apt#
 
35
 
VARCHAR
 
N
 
shipCity
 
Sh ip
-
to
 
City
 
Name
 
28
 
VARCHAR
 
Y
 
shipEmail
 
Drop
 
Sh ip
 
E mail
 
address
 
105
 
VARCHAR
 
Y
 
shipMethod
 
E x:
 
UPS
 
15
 
VARCHAR
 
Y
 
shipState
 
Sh ip
-
to
 
Sta te
 
Name
 
2
 
VARCHAR
 
Y
 
shipTo
 
Ship
-
to
 
Co mpany
 
Name
 
28
 
VARCHAR
 
N
 
 
shipZip
 
 
Sh ip
-
to
 
ZIP
 
Cod e.
 
5
 
d igits
 
or
 
5
 
d igits
-
4
 
digits.
 
Ad d
 
Preced in g
 
Zeros ,
 
if
 
n e ed e d .
 
E x:
 
008054
 
or
    
 
98007
-
1156
 
or980071156
 
5
 
-
 
10
 
Numbers 
Only.
 
Min
 
5
 
Chars
 
 
VARCHAR
 
 
Y
 
color
 
Pro d u ct Color.  E x: Black.  (Mu s t u s e t h e 
SANM AR _MAIN FR AME _C OLO R d at a.  This  ca n  b e 
retriev ed  fro m t h e 
San mar _S DL_N.CS V fil e o n  o u r
 
FTP
 
s erv er,
 
or
 
th ro u gh
 
th e
 
San Ma r
 
Dat a
 
Lib ra ry
 
file 
on
 
San Ma r.co m)
 
50
 
VARCHAR
 
Y
 
errorOccured
 
Leave
 
Blank
 
 
 
N
 
inventoryKey
 
20828
 
10
 
INT
 
Y
 
message
 
Leave
 
Blank
 
 
VARCHAR
 
N
 
poId
 
Leave
 
Blank
 
11
 
VARCHAR
 
N
 
quantity
 
N u mb er
 
of
 
Pro d u cts
 
o rd ered
 
EX:12
 
6
 
INT
 
Y
 
size
 
Pro d u ct
 
SIZE
 
-
 
E x:
 
XL
 
50
 
VARCHAR
 
Y
 
sizeIndex
 
5
 
11
 
INT
 
Y
 
style
 
E x:
 
K500
 
60
 
VARCHAR
 
Y
 
*whs eNo
 
Leave
 
Blank
 
10
 
INT
 
N
 
 
*W areho use
 
select io n
 
requires
 
a
 
mo dificatio n
 
to
 
y o ur
 
inte gratio n
 
o rder
 
pro cessing,
 
and
 
y o u
 
will
 
nee d
 
to  
utilize the inv ento ry w eb serv ice befo re placing o rders. P lease co ntact the SanMar Inte gratio n Team to  
discuss using t hiso ptio n.
 


25
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
San Mar
 
Stan d ar d
 
su b mitPO
 
Ser vic e
 
XML
 
Request
 
 
The fo llowing demo nstrates an APIcall to  subm it a PO fo r sty le K4 20 , co lo r black,size small ( S),and a 
quantity
 
of
 
10.
 
This
 
serv ice
 
subm its
 
the
 
PO
 
request
 
and
 
returns
 
a
 
message
 
respo nse
 
of
 
^ 
 
Subm issio n 
’µ˚’’(µo_} „W˚„„}ı]} v†_ X
 
 
<soapenv :Envel ope x m lns:soap env="h ttp:/ / schemas. xmlsoa p.org / soap/env elope/ " 
xmlns:we b="htt p://w e bservice .integ ratio n .sanmar. com/">
 
  
<soapenv:Header/>
 
  
<soapenv:Body>
 
    
<web:submitPO>
 
      
<arg0>
 
        
<attention>P leaseDelete</attent ion>
 
        
<notes/>
 
        
<poNum>Integ rationTestOrder</p oNum>
 
        
<shipTo>SanM arCorporationInc.< /shipTo>
 
        
<shipAddress 1>22833 SEBlackNug getRd</shipAddress1 >
 
        
<shipAddress 2>Ste130</shipAddre ss2>
 
        
<shipCity>Is saquah</shipCity>
 
        
<shipState>W A</shipState>
 
        
<shipZip>980 29</shipZip>
 
        
<shipMethod> UPS</shipMethod>
 
        
<shipEmail>n oemail@sanmar.com</s hipEmail>
 
        
<residence>N </residence>
 
        
<department />
 
        
<notes/>
 
        
<webServiceP oDetailList>
 
          
<inventory Key/>
 
          
<sizeIndex />
 
          
<style>K42 0</style>
 
          
<color>Bla ck</color>
 
          
<size>S</s ize>
 
          
<quantity> 10</quantity>
 
          
<whseNo/>
 
        
</webService PoDetailList>
 
      
</arg0>
 
      
<arg1>
 
        
<sanMarCusto merNumber>12345</san MarCustomerNumber>
 
        
<sanMarUserN ame>YourSanMar.comUs eername</sanMarUserN ame>
 
        
<sanMarUserP assword>YourSanmar.c omPassword</sanMarUs erPassword>
 
      
</arg1>
 
    
</web:submitPO>
 
  
</soapenv:Body>
 
</soapen v:Enve lope
>
 
 
 
 
 
 
 
 
 
 
 
 
 


26
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
San Mar
 
Stan d ar d
 
su b mitPO
 
Ser vic e
 
XML
 
Respon se
 
 
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
 
  
<S:Body>
 
    
<ns2:submitPOResponse 
 
    
xmlns:ns2="http://webservice.integration.sanmar.com/">
 
      
<return>
 
        
<errorOccurred>false</errorOccurred>
 
        
<message>PO Submission successful</message>
 
      
</return>
 
    
</ns2:submitPOResponse>
 
  
</S:Body>
 
</S:Envelope>


27
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
SanMar
 
P rom oSta ndards
 
Web
 
Serv ic es
 
Or der
 
Integration
 
 
Order
 
proces sing
 
set up
 
in
 
bo th
 
in
 
bo th
 
o ur
 
ED EV
 
and
 
pro ductio n
 
env ironm ents
 
can
 
take
 
24
-
48
 
hours.
 
 
ED EV :
  
htt ps :/ / ed ev
-
ws. sanmar.co m:8080/ promo standards/POServiceBinding?WSDL
 
PRODUCTION:
 
https://ws.sanmar.com:8080/promostandards/POServiceBinding?WSDL 
There are two functio ns available fo r t hiswe b serv ice:
 
GetSupported
Order
Types 
 
SendPO
 
 
 
 


28
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
PromoStandards
 
GetSup ported
Order
Types
 
Service
 
 
This serv ice
 
returns suppo rted
 
O
rder ty pes. This allo ws
 
the
 
co nsumer
 
of
 
the
 
serv ice
 
to o btain
 
suppo rted
 
purchase
 
o rder
 
data
 
fo r
 
their
 
needs.
 
P lease
 
be
 
aware
 
that
 
the
 
response
 
will
 
alway s 
state 
BL ANK, because SanM aronly ships blank pro ducts .
 
 
Pr omoStandar ds
 
G etSuppor ted
Or der
Types
 
Ser vic e
 
Request
 
Parameters
 
 
Fie ld
 
Descr iption
 
Example
 
Required
 
Type
 
M ax
 
Chars
 
wsVersion
 
Pr o m o s t a n d a r d s
 
Version
 
1.0.0
 
Yes
 
STRIN G
 
64
 
id
 
S a n M a r. c o m
 
Us ername
 
YourSanmar.co mUsername
 
Yes
 
STRIN G
 
64
 
password
 
S a n M a r. c o m
 
Pass word
 
YourSanmar.co mPass word
 
Yes
 
STRIN G
 
64
 
 
 
Pr omoStandar ds
 
G etSuppor ted
Or der
Types
 
Ser vic e
 
XM L
 
Request
 
 
<soapenv:Envelope xmlns:soapenv
="http://schemas.xmlsoap.org/soap/envelope/" 
xmlns:ns="http://www.promostandards.org/WSDL/PO/1.0.0/" 
xmlns:shar="http://www.promostandards.org/WSDL/PO/1.0.0/SharedObjects/">
 
  
<soapenv:Header />
 
  
<soapenv:Body>
 
    
<ns:GetSupportedOrderTypesRequest>
 
      
<shar:wsVersion>1.0.0</shar:wsVersion>
 
      
<shar:id>YourSanmar.comUsername</shar:id>
 
      
<shar:password>YourSanmar.comPassword</shar:password>
 
    
</ns:GetSupportedOrderTypesRequest>
 
  
</soapenv:Body>
 
</soapenv:Envelope>
 
 
Fie ld
 
Descr iption
 
Type
 
supportedOrd erTypes
 
An
 
ar ra y
 
of
 
s up p o rted
 
o rd er
 
typ es
 
fo r
 
th is
 
su p p lier.
 
Sign ifies
 
which
 
o rd er
 
ty p es
 
th e
 
s u p p lier
 
s u p p o rts .
 
Valu es
 
ar e
 
en u mera t ed : 
^ l_ U o˚_ U› o˚_ (]Pµ„ ˚ˆ _
 
ARRAY
 
ServiceMessageArray
 
An
 
ar ra y
 
of
 
Serv iceM es s age
 
objects.
 
OBJECT
 
 
 
Pr omoStandar ds
 
G etSuppor ted
Or der
Types
 
Ser vic e
 
XM L
 
Response
 
 
<S:Envel ope xm lns:S = "http:// schema s.xml s oap.org/ soap/e nvelo p e/">
 
  
<S:Body>
 
    
<ns2:GetSupporte dOrderTypesResponse
 
    
xmlns:ns2="http: //www.promostandards .org/WSDL/PO/1.0.0/"  
 
    
xmlns="http://ww w.promostandards.org /WSDL/PO/1.0.0/Share dObjects/">
 
      
<ns2:supported OrderTypes>Blank</ns 2:supportedOrderType s>
 
    
</ns2:GetSupport edOrderTypesResponse >
 
  
</S:Body>
 
</S:Enve lope>


29
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Pr omoStan d ar d s
 
Sen d PO
 
Service
 
PleaseNote: 
DoNotUse
 
Additional
 
Commasin 
anyFi eldDuetotheCommabeingourDelimiterinorder 
files.
 
This
 
functio n
 
will
 
send
 
a
 
configured
 
purchase
 
o rder
 
to
 
a
 
vendor.
 
 
Pr omoStandar ds
 
SendPO
 
Ser vic e
 
Request
 
Parameters
 
 
Fie ld
 
Name
 
Fie ld
 
De scription
 
Char 
Limit
 
Type
 
Required
 
wsVersion
 
Pr o m o
S
t a n d ar d s
 
Version
 
64
 
STRIN G
 
Yes
 
id
 
S a n M a r. c o m
 
Us ername
 
64
 
STRIN G
 
Yes
 
password
 
S a n M a r. c o m
 
Pass word
 
64
 
STRIN G
 
Yes
 
orderType
 
Th e
 
ty p e
 
of
 
d at a
 
tra n s ferr ed
 
in
 
th e
 
req u es t;
 
v alu es
 
ar e 
˚v µ u˚„ ı˚ˆ l_
v
Th is  is  d at a is  for b lan k 
P}} ˆ ’ X^ o˚_
v
Th is  d at a is fo r a ra n d o m s amp le 
} „ˆ ˚› o ˚_
v
Th e d at a in  t h e p u rch as e o rd er is  
s en t
 
o v er
 
with o u t
 
s u pp lier
 
con figur ed
 
d at a
 
an d
 
will
 
b e 
› „} ˚’ ’ ˚ˆ µ ooÇ (]Pµ „˚ˆ _
v
Th e d at a is  s en t 
o v er
 
in
 
con ju n ctio n
 
with
 
th e
 
’ µ › › o]˚„[ ’
 
Pro d u ct
 
Pricin g
 
an d
 
Con figur at ion
 
web
 
s e rv ice
 
an d
 
d es igned
 
fo r 
electro n ic p ro c es s in g o f t h e p u rch as e o rd er.
 
64
 
VARCHAR
 
Yes
 
orderNu mber
 
Pu rch as e
 
Ord er
 
Number
 
28
 
VARCHAR
 
Yes
 
orderDate
 
Dat e
 
an d
 
time
 
of
 
th e
 
p u rch as e
 
o rd er.
 
(2018
-
08
-
 
27T00:00:00)
 
 
DATE
 
Yes
 
totalAmount
 
Th e
 
total
 
d o llar
 
amou n t
 
of
 
th e
 
p u rch as e
 
order
 
12,4
 
DECIMAL
 
Yes
 
rush
 
Us ed
 
to
 
in d icate
 
a
 
ru s h
 
on
 
th e
 
p u rch as e
 
order
 
 
BOOLE AN
 
Yes
 
curren cy
 
Th e
 
cu rren cy
 
th e
 
p u rch as e
 
o rd er
 
is
 
tra n s act ed
 
in
 
ISO4217
 
fo rmat .
 
(USD)
 
3
 
VARCHAR
 
Yes
 
termsAndCond itions
 
Th e
 
ter ms
 
an d
 
con d itio n s
 
fo r
 
th is
 
p u rch as e
 
o rd er. 
In fo rmat ion  t h at  is  o rd er s p ecific o r in fo r mat ion
 
d ealin g
 
with
 
th e
 
con figur at ion
 
or
 
s h ip men t
 
of
 
th e 
o rd er s h o u ld  
n o tb e en tered  h ere.
 
255
 
VARCHAR
 
No
 
salesChann el
 
San Ma r Sy s tem Dep t Cod e
 
3
 
VARCHAR
 
No
 
 
 
shipReferences
 
Arra y  o f t wo  s trin gs  max o f id en tifiers  u s ed  a s  t h e 
refer en ce
 
field s
 
u s ed
 
d u rin g
 
th e
 
s h ip p in g
 
p ro ces s .
 
A 
s h ip Referen c e
 
can  b e a  p u rch as e o rd er n u mb er,
 
cu s to mer n u mb er,  co mp an y  n ame,  Bill o f L ad in g 
n u mb er,
 
or
 
a
 
p h ra s e
 
th at
 
id en tifies
 
th at
 
s h ip men t.
 
64
 
VARCHAR
 
Yes
 
 
comments
 
Com men ts  r egard in g t h e s h ip men t fo r fu rth er 
clarificatio n .
 
N o te: Us e co mm en ts  o n ly  wh en  
ab s o lu tely
 
n eces s ar y ,
 
as
 
it
 
may
 
cau s e
 
d elay s
 
in
 
o rd er
 
processing.
 
255
 
VARCHAR
 
Yes
 
allo wConsolidation
 
Allow
 
con s o lida tio n
 
of
 
shipments
 
 
BOOLE AN
 
Yes
 
blindShip
 
Req u ire
 
b lind
 
shipping
 
 
BOOLE AN
 
Yes
 
packingListRequired
 
Pa ckin g
 
lis t
 
required
 
 
BOOLE AN
 
Yes
 
carrier
 
Th e
 
carri er
 
n am e
 
of
 
th e
 
s h ip p in g
 
v en d o r
 
being
 
req u es ted .
 
Us e
 
eith er
 
UPS
 
or
 
USPS.
 
64
 
VARCHAR
 
Yes
 
service
 
Th e
 
s erv ice
 
cod e
 
of
 
th e
 
s h ip p in g
 
carrier.
 
USP S
:
 
PP:
 
APP
 
USPS
 
Sh ipMethod
:
 
GROUN D
 
UPS
:
 
ShipMethod
:
 
GROUN D,2N D
 
DAY, 2ND
 
DAY
 
AM, 
N E XTDAY,  N E XT 
DAY SV, N E XT  DAY E A,
 
64
 
VARCHAR
 
Yes
 


30
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
 
 
SAT URDA Y,
 
3RD
 
DA Y,
 
PSS T:
 
PSST
 
PSST
:
 
PSST
 
 
 
 
customerPickup
 
Th e
 
s h ip men t
 
will
 
be
 
a
 
p icku p
 
an d
 
will
 
n o t
 
be
 
shipped.
 
 
BOOLE AN
 
Yes
 
attention To
 
˚ ]À ˚„[ ’
 
firs t
 
an d
 
las t
 
name
 
35
 
VARCHAR
 
No
 
companyName
 
ShipTo
 
Company
 
Name
 
35
 
VARCHAR
 
No
 
address1
 
Sh ip To
 
Ad d res s
 
line
 
1
 
35
 
VARCHAR
 
Yes
 
address2
 
Sh ip To
 
Ad d res s
 
line
 
2
 
35
 
VARCHAR
 
No
 
city
 
Sh ip To
 
City
 
(Seattle)
 
30
 
VARCHAR
 
Yes
 
region
 
Th e
 
two
-
ch ar act er
 
US
 
s ta te
 
ab breviation .
 
3
 
VARCHAR
 
Yes
 
postalCod e
 
US
 
p o s ta l
 
cod e
 
(98065)
 
10
 
VARCHAR
 
Yes
 
country
 
Th e
 
cou n try
 
in
 
ISO
 
316 6
-
2
 
fo r mat
 
(US)
 
2
 
VARCHAR
 
Yes
 
email
 
Sh ip To
 
e mail
 
address
 
105
 
VARCHAR
 
No
 
phone
 
Sh ip To
 
Ph o n e
 
Nu mber
 
32
 
VARCHAR
 
No
 
 
comments
 
Com men ts  r egard in g t h e co n t act  for fu rth er 
clarificatio n .
 
N o te: Us e co mm en ts  o n ly  wh en
 
ab s o lu tely
 
n eces s ar y ,
 
as
 
it
 
may
 
cau s e
 
d elay s
 
in
 
o rd er 
processing.
 
255
 
VARCHAR
 
 
No
 
shipmentId
 
Th e
 
s h ip men t
 
Id
 
 
INT
 
Yes
 
lineNu mber
 
Th e
 
line
 
n u mb er
 
of
 
th e
 
line
 
item
 
64
 
VARCHAR
 
Yes
 
description
 
Th e
 
d es crip tio n
 
of
 
th e
 
line
 
ite m.
 
For
 
s imp l e
 
o rd er
 
type
 
(n o t
 
u s in g
 
a
 
con figur at ion ),
 
u se
 
th is
 
field
 
to
 
exp lain
 
th e 
details.
 
255
 
VARCHAR
 
Yes
 
lineType
 
Th e
 
ty p e
 
of
 
o rd er;
 
v alu es
 
ar e
 
enumerated :
 

 
^ ˚Á_
 
t
A
 
n ew
 
p u rch as e
 
o rd er
 
with
 
no
 
p rior 
o rd er ref eren c e
 

 
^› ˚ı _
 
v
An
 
exa ct
 
r ep eat
 
of
 
a
 
p rev iou s  
p u rch as e o rd er with  t h e v en d o r
 

 
^(˚ „˚v  ˚_
 
t
An
 
o rd er
 
th at
 
h as
 
th e
 
same
 
ar twork
 
as
 
a
 
p rev ious
 
order.
 
64
 
VARCHAR
 
Yes
 
toleran ce
 
An  en u mera to r s p ecify in g t h e  q u an tit y  t o lera n ce 
allo wed :
 
Allo wOv erRu n ,  
Allo wUn d erru n ,  
AllowOv erru n Or Un d erru n ,  E xa ctOn ly .
 
Sp ecify in g 
AllowOv er Ru n ,  Allo wUn d erru n  o r
 
AllowOv erru n Or Un d erru n
 
wit h o u t
 
a
 
v alu e
 
an d
 
u o m 
Á]oo ˚’ µ ]v Z ˚ µ › › o]˚„[ ’ ]’„˚ı]} v X
 
64
 
VARCHAR
 
 
allo wPartialSh ipments
 
Allow
 
p ar tia l
 
s h ip m en ts
 
of
 
th is
 
line
 
item
 
 
BOOLE AN
 
Yes
 
lineItemTotal
 
Th e
 
total
 
fo r
 
th e
 
lin e
 
item
 
12,4
 
DECIMAL
 
Yes
 
partId
 
Th e
 
p ar t
 
Id
 
fro m
 
th e
 
’ µ › › o]˚„[ ’
 
Pro mo Sta n d ar d s  
Pro d u ct Pricin g a n d  Co n figur at ion  s erv ice
 
64
 
VARCHAR
 
Yes
 
customerSupp lied
 
Th e
 
p ar t
 
will
 
be
 
s u p p lied
 
by
 
the
 
cu s to mer
 
or
 
an o th er 
en tit y  o th er th an  t h e sup p lier
 
 
BOOLE AN
 
Yes
 
uom
 
Th e
 
u n it
 
of
 
meas u re;
 
v alu es
 
ar e
 
enu merated.
 
Valu es
 
ar e:
 
{BX,
 
CA,
 
DZ,
 
E A,
 
K T ,
 
PR,
 
PK,
 
RL,
 
ST,
 
SL,
 
TH}
 
BX 
-
 
Box 
CA 
-
 
Cas e 
DZ
 
-
 
Dozen 
E A 
-
 
E ach  
KT 
-
 
K it
 
PR
 
-
 
Pair
 
PK
 
-
 
Package
 
2
 
VARCHAR
 
Yes
 


31
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
 
 
RL
 
-
 
Roll 
ST
 
-
 
Set
 
SL
 
-
 
Sleeve
 
TH
 
-
 
Thousand
 
 
 
 
value
 
Th e
 
q u an tit y
 
value
 
2
 
VARCHAR
 
Yes
 
FobID
 
In d icate t h e FOB p o in t (War e h o u s e Selectio n )
 
2
 
VARCHAR
 
No
 
location LinkId
 
An
 
ar ra y
 
of
 
loca tio n
 
link
 
Id s .
 
T h is
 
link s
 
th e
 
p ar t
 
to
 
its  
con figur ed
 
loca tio n s .
 
 
INT
 
No
 
 
 
Pr omo
S
tandar ds
 
sendPO
 
Ser vic e
 
Request
 
 
<soapenv :Envel ope x m lns:soap env="h ttp:/ / schemas. xmlsoa p.org / soap/env elope/ " 
xmlns:ns ="http ://ww w .promost andard s.org / WSDL/PO/ 1.0.0/ " 
xmlns:sh ar="ht tp:// w ww.promo standa rds.o r g/WSDL/P O/1.0. 0/Sha r edObject s/">
 
  
<soapenv:Header/>
 
  
<soapenv:Body>
 
    
<ns:SendPOReques t>
 
      
<shar:wsVersio n>1.0.0</shar:wsVers ion>
 
      
<shar:id>YourS anmar.comUsername</s har:id>
 
      
<shar:password >YourSanmar.comPassw ord</shar:password>
 
      
<ns:PO>
 
        
<ns:orderTyp e>Blank</ns:orderTyp e>
 
        
<ns:orderNum ber>TEST01</ns:order Number>
 
        
<ns:orderDat e>2022
-
02
-
08T00:00:0 0</ns:orderDate>
 
        
<ns:totalAmo unt>10.00</ns:totalA mount>
 
        
<ns:rush>tru e</ns:rush>
 
        
<shar:curren cy>USD</shar:currenc y>
 
        
<ns:Shipment Array><!
--
1ormore repetitions:
--
>
 
          
<shar:Ship ment><!
--
0to2rep etitions:
--
>
 
            
<shar:sh ipReferences>1</shar :shipReferences>
 
            
<shar:co mments>?</shar:comme nts>
 
            
<shar:al lowConsolidation>fal se</shar:allowConsol idation>
 
            
<shar:bl indShip>false</shar: blindShip>
 
            
<shar:pa ckingListRequired>fa lse</shar:packingLis tRequired>
 
            
<shar:Fr eightDetails>
 
              
<shar: carrier>UPS</shar:ca rrier>
 
              
<shar: service>Ground</shar :service>
 
            
</shar:F reightDetails>
 
            
<shar:Sh ipTo>
 
              
<shar: customerPickup>false </shar:customerPicku p>
 
              
<shar: ContactDetails>
 
                
<sha r:attentionTo>Test</ shar:attentionTo>
 
                
<sha r:companyName>SanMar </shar:companyName>
 
                
<sha r:address1>123Test St.</shar:address1>
 
                
<sha r:address2>Ste2</sh ar:address2>
 
                
<sha r:city>Issaquah</sha r:city>
 
                
<sha r:region>WA</shar:re gion>
 
                
<sha r:postalCode>12345</ shar:postalCode>
 
                
<sha r:country>US</shar:c ountry>
 
                
<sha r:email>noemail@sanm ar.com</shar:email>
 
                
<sha r:phone>425
-
123
-
4567 </shar:phone>
 
                
<sha r:comments>comments< /shar:comments>
 
              
</shar :ContactDetails>
 
              
<shar: shipmentId>1</shar:s hipmentId>
 


32
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
            
</shar:S hipTo>
 
          
</shar:Shi pment>
 
        
</ns:Shipmen tArray>
 
        
<ns:LineItem Array>
 
          
<ns:LineIt em>
 
            
<ns:line Number>1</ns:lineNum ber>
 
            
<shar:de scription>?</shar:de scription>
 
            
<ns:line Type>New</ns:lineTyp e>
 
            
<shar:fo bId>1</shar:fobId>
 
            
<shar:To leranceDetails>
 
              
<shar: tolerance>AllowOverr un</shar:tolerance>
 
            
</shar:T oleranceDetails>
 
            
<ns:allo wPartialShipments>fa lse</ns:allowPartial Shipments>
 
            
<ns:line ItemTotal>100</ns:li neItemTotal>
 
            
<ns:Part Array>
 
               
<shar :Part><!
--
1ormore repetitions:
--
>
 
                
<sha r:partId>92032</shar :partId>
 
                
<sha r:customerSupplied>f alse</shar:customerS upplied>
 
                
<sha r:Quantity>
 
                  
<s har:uom>PK</
shar:uom >
 
                  
<s har:value>25</shar:v alue>
 
                
</sh ar:Quantity>
 
                
<sha r:locationLinkId>01< /shar:locationLinkId ><!
--
Zeroor more
 
                
repe titions:
--
>
 
              
</shar :Part>
 
              
<shar: Part>
 
                
<sha r:partId>92033</shar :partId>
 
                
<sha r:customerSupplied>f alse</shar:customerS upplied>
 
                
<sha r:Quantity>
 
                  
<s har:uom>PK</shar:uom >
 
                  
<s har:value>25</shar:v alue>
 
                
</sh ar:Quantity>
 
                
<sha r:locationLinkId>1</ shar:locationLinkId>
 
              
</shar :Part>
 
            
</ns:Par tArray>
 
          
</ns:LineI tem>
 
        
</ns:LineIte mArray>
 
        
<ns:termsAnd Conditions>?</ns:ter msAndConditions>
 
        
<ns:salesCha nnel>?</ns:salesChan nel>
 
      
</ns:PO>
 
    
</ns:SendPOReque st>
 
  
</soapenv:Body>
 
</soapen v:Enve lope>
 
 
 
 
 
 
 
 
 
 
 
 


33
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Pr omo
S
tandar ds
 
sendPO
 
Ser vic e
 
Response
 
 
Upo n
 
a
 
successful
 
subm issio n,
 
the
 
sendP O
 
respo nse
 
will
 
display
 
a
 
transactio n
 
identifier
 
which
 
includes 
the PO num ber. If no  t ransactio n identifier is re turned, a po pulated Erro rMessage is returned.
 
 
<S:Envel ope xm lns:S = "http:// schema s.xml s oap.org/ soap/e nvelo p e/">
 
  
<S:Body>
 
    
<ns2:SendPORespo nsexmlns:ns2="http: //www.promostandards .org/WSDL/PO/1.0.0/"  
 
    
xmlns="http://ww w.promostandards.org /WSDL/PO/1.0.0/Share dObjects/">
 
      
<ns2:transacti onId>TEST01
-
p
-
5877
-
1679510682389</ns2:tr ansactionId>
 
    
</ns2:SendPOResp onse>
 
  
</S:Body>
 
</S:Enve lope>
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 


34
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
Change
 
Log
 
 
J ul y
 
2024
 

 
Ad de d Su p po rt fo r VA w are h o us e (31 ).
 

 
Update d
 
Brand
 
Restrictions.
 
 
A pr i l
 
2024
 

 
U pd ate d 
s up po rt e d Ed ev Tes t P ro d uc t I Ds
.
 

 
Update d
 
Brand
 
Restrictions.
 
 
M ar c h 20 24
 

 
 ›ˆ ı˚ ˆ Z À]  Pµ] ˆ v ( } „} u} ı v ˆ „ ˆ’ Z˚Æ  Ç[ X
 
 
Oc to b er  
2023
 

 
Changes to FileNam e
 
Guidance.
 

 
UpdatedDateCharacterGuidance.
 

 
Update d
 
Brand
 
Restrictions.
 
 
J un e 
2023
 

 
Fo rm att ing Updates to  Exam ple Calls.
 

 
UpdatedPO#CharacterLimitforPromoStandardsGuidance
 

 
Update d
 
Brand
 
Restrictions
.
 
 
D ec e m ber
 
2022
 

 
Update d
 
PromoStandards 
Get Suppo rtedOrderTy pesL anguage
 

 
Update d P rom o StandardsSubm it POP aram eters fo rOffice Co deand W areho use Subm ittal
 

 
Update d
 
Brand
 
Restrictions
 

 
Update d
 
P o Subm ittals to  refrain from  using Comm as
 

 
Update d Suppo rted Zip Code Fo rm ats
 

 
Update d Inte gratio n Fo lder Info rm atio n
 
 
A ug us t
 
2022
 

 
Update d
 
Guidance
 
aro und
 
Co nso lidating
 
duplicate
 
L ine
 
Items.
 

 
Update d
 
Brand
 
Restrictions
 

 
Update d
 
Flat
 
File
 
Order
 
Submission
 
 
F e br u ar y
 
2022
 

 
Update d
 
and
 
rev ised
 
all
 
sectio ns
 
of
 
the
 
P urchase
 
Order
 
Inte gratio n
 
Guide
 

 
Update d
 
EUAT
 
 
 
to
 
ED EV
 
[’
 
 
Oc to b er
 
2020
 

 
Update d
 
PO
 
characte r
 
length
 
from
 
12
 
to
 
28
 
m ax
 
characters
 

 
Added
 
credit
 
payment
 
option
 
forintegrationorders
 

 
Added
 
new
 
brands;
 
Allmade,
 
Champion,
 
Cotopaxi
 
 
 


35
 
 
 
SanMar
 
Purc ha se
 
O rder
 
I nte grati o n
 
Gui de
 
v21.
9
 
0
 
 
May
 
2020
 

 
UpdatedTruckship 
methods
 

 
Update
 
Em ail
 
Characte r
 
L imit
 
to
 
105
 

 
Update d
 
eUAT
 
te sting
 
env iro nment
 
to
 
the
 
eUAT
 
environment
 
 
August
 
2019
 

 
U pd ate d
 
P ro mo St a nd ar ds
 
s hip
 
metho ds
 
 
May
 
2019
 

 
Ad de d
 
P ro mo St an d ar ds
 
s hi p
 
me tho d
 
PSST
 

 
S pli t
 
P ro mo St an d ar ds
 
c arri e r
 
an d
 
s ervic e
 
parameters
 

 
U pd ate d
 
P ro mo S ta n da r ds
 
S hip
 
Me t ho ds
 
Information
 
 
Se pt e mb er
 
2018
 

 
U pd ate d
 
P ro mo St a n da rds
 
P urc has e
 
Or de r
 
Informatio n
 

 
Added
 
FED EX
 
ShipMethods
 
 
August
 
2018
 

 
Ad de d
 
P ro mo St a n da rds
 
P u r c has e
 
O rd er
 
integratio n
 

 
AddedPSSTShipMethod
 
and 
Information
 
 
D ec e m ber
 
2017
 

 
Update d
 
all
 
links
 
stage
 
env iro nment
 
WSDL s
 
from
 
stage
 
to
 
eUAT
 
fo r
 
im pro ved
 
access
 
and 
stability
 
 
Oc to b er
 
2017
 

 
Update d
 
links
 
to
 
sanmar.com
 

 
U pd ate d
 
B ra n d
 
R es tric ti o n
 
informatio n
 

 
Added
 
The
 
No rth
 
Face
 
to
 
Brand
 
Restrictions
 

 
Added
 
Rabbit
 
Skins
 
to
 
Brand
 
Restrictions
 
