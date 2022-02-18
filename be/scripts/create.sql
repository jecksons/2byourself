create table user
(
   id_user int not null auto_increment,
   description varchar(100) not null,
   email varchar(200),
   constraint pk_user primary key(id_user)
);

insert into user
(
   description
)
values
(
   'Demo user'
);

commit;

create table refresh_token
(
   token varchar(200) not null,
   id_user int not null,
   expire_date datetime not null,
   created_at datetime,
   constraint pk_refresh_token primary key(token)
);

alter table refresh_token add constraint fk_refresh_token_id_user
foreign key(id_user) references user(id_user) on delete cascade;


create table unique_code
(
    code_string varchar(100) not null,
    constraint pk_unique_code primary key(code_string)
);

create table brand (
   id_brand int not null auto_increment,
   description varchar(50) not null,
   constraint pk_brand primary key(id_brand)
);

create table product_category (
   id_product_category int not null auto_increment,
   description varchar(50) not null,
   constraint pk_product_category primary key(id_product_category)
);

create table size(
   id_size int not null auto_increment,
   description varchar(20) not null,
   constraint pk_size primary key(id_size)
);

create table product (
   id_product varchar(15) not null,
   description varchar(200) not null,
   price float not null,
   id_product_category int not null,
   id_brand int not null,
   id_image int,
   user_rating int,
   user_fit_sizing int,
   constraint pk_product primary key(id_product)
);


alter table product add constraint  fk_product_prd_category foreign key(id_product_category) references product_category(id_product_category);

alter table product add constraint  fk_product_brand foreign key(id_brand) references brand(id_brand);

create table product_category_size (
   id_product_category int not null,
   id_size int not null,
   constraint pk_product_category_size primary key(id_product_category, id_size)
);


create table offer (
   id_offer int not null auto_increment,
   description varchar(50) not null,
   discount float not null,
   constraint pk_offer primary key(id_offer)   
);

create table discount_code 
(
   id_discount_code varchar(20) not null,
   discount float not null,
   constraint pk_discount_code primary key(id_discount_code)
);


alter table product add id_offer int;

alter table product add constraint fk_product_offer foreign key(id_offer) references offer(id_offer);



create table cart 
(
   id_cart varchar(20) not null,
   created_at datetime not null,
   constraint pk_cart primary key(id_cart)
);



create table cart_item
(
   id_cart_item int not null auto_increment,
   id_cart varchar(20) not null,
   id_product varchar(15) not null,
   id_size int not null,
   quantity float not null,
   price float not null,
   offer_discount float not null,
   total_value float not null,
   constraint pk_cart_item primary key(id_cart_item)
);

alter table cart_item add constraint fk_cart_item_cart foreign key(id_cart) references cart(id_cart) on delete cascade;

create table sale_status
(
   id_sale_status varchar(1) not null,
   description varchar(20) not null,
   constraint pk_sale_status primary key(id_sale_status)
);


create table sale_order
(
   id_sale_order int not null auto_increment,
   created_at datetime not null,
   id_user int not null,
   email varchar(200),
   items_value float not null,
   id_discount_code varchar(20),
   discount_code_value float not null,
   offer_discount_value float not null,
   freight_value float not null,
   total_value float not null,
   id_cart varchar(20) not null,   
   id_sale_status varchar(1) not null,
   constraint pk_sale_order primary key(id_sale_order)
);

alter table sale_order auto_increment=1000000;

alter table sale_order add constraint fk_sale_order_user foreign key(id_user) references user(id_user);

alter table sale_order add constraint fk_sale_order_disc_code foreign key(id_discount_code) references discount_code(id_discount_code);

alter table sale_order add constraint fk_sale_order_cart foreign key(id_cart) references cart(id_cart);

alter table sale_order add constraint fk_sale_order_status foreign key(id_sale_status) references sale_status(id_sale_status);

create table sale_order_history
(
   id_sale_order_history int not null auto_increment,
   id_sale_order int not null,
   event_date datetime not null,
   id_sale_status varchar(1) not null,
   constraint pk_sale_order_history primary key(id_sale_order_history)
);

alter table sale_order_history add constraint fk_sale_order_history_so foreign key(id_sale_order) references sale_order(id_sale_order) on delete cascade;

alter table sale_order_history add constraint fk_sale_order_history_st foreign key(id_sale_status) references sale_status(id_sale_status);

create table payment_method 
(
   id_payment_method  int not null auto_increment,
   description varchar(100) not null,
   constraint pk_payment_method  primary key(id_payment_method)
);

alter table sale_order add id_payment_method int not null;

alter table sale_order add constraint fk_sale_order_payment foreign key(id_payment_method) references payment_method(id_payment_method);

insert into sale_status(id_sale_status, description) values('O', 'Ordered');

insert into sale_status(id_sale_status, description) values('P', 'Payment Pending');

insert into sale_status(id_sale_status, description) values('S', 'Preparation to Ship');

insert into sale_status(id_sale_status, description) values('T', 'In Transportation');

insert into sale_status(id_sale_status, description) values('D', 'Delivered');

commit;


insert into brand (id_brand, description) values(1, 'Kardia');

insert into brand (id_brand, description) values(2, 'Birdland');

insert into brand (id_brand, description) values(3, 'Lizzty');

insert into brand (id_brand, description) values(4, 'No BS');

insert into brand (id_brand, description) values(5, 'Anna Pop');

insert into brand (id_brand, description) values(6, 'The Bell');

COMMIT;   

insert into product_category(id_product_category, description) values(1, 'Polo Shirts');

insert into product_category(id_product_category, description) values(2, 'T-Shirts');

insert into product_category(id_product_category, description) values(3, 'Dress Shirts');

insert into product_category(id_product_category, description) values(4, 'Casual Shirts');

insert into product_category(id_product_category, description) values(5, 'Hoodies');

alter table product add genre varchar(1);

insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('White Polo Shirt', 1,1,50.8,5,3,1, 'fwubdTCsLIPgISh', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('White Bare T-Shirt', 2,2,44.7,5,4,6, 'kGseiSbNItBrtgf', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Men’s Pieced Shirt White', 3,3,59.5,2,4,5, 'tclglAbTyuWNNPf', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Blue Casual Shirt', 4,4,47.5,4,2,6, 'vTCLBtdHoFjIVPf', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Purple Polo Shirt', 5,1,67.8,3,4,2, 'apNUmGvdeRQCQsP', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Grey Polo Shirt', 6,1,39.8,1,4,6, 'ayJltVsLHHlSATd', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Red Polo Shirt', 7,1,32.8,1,5,1, 'bdQAdeiAXNDHWyv', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Royal Blue Polo Shirt', 8,1,45.3,2,3,2, 'befuBIuKhYLApdy', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Green Polo Shirt', 9,1,56.1,2,3,5, 'bjdynpmIeQqGoxQ', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Black Classic Shirt', 10,3,68.7,3,3,1, 'bKwXPKUDOgewKCE', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Royal Navy Bare T-Shirt', 11,2,47.7,4,2,6, 'BLcfYnFudOfSGLk', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Black T-Shirt', 12,2,50.8,4,2,3, 'bNcYvihtCIvvEdr', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Crossmarks Blue Shirt', 13,4,33.9,2,4,4, 'bQTsNoDSBKxsjkL', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Yellow T-Shirt', 14,2,69.4,4,1,1, 'cuLYSahgJKnJSVa', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Easy Mode T-Shirt White', 15,2,60.1,2,5,2, 'dGdKCpXRaLEDUqu', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('White Hoodie', 16,5,35.3,2,3,4, 'dqhOpFXJOAhhTWF', 'M');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Grey Hoodie', 17,5,62,3,5,4, 'DyjPKRiShpMXoHq', 'M');

commit;


insert into size(id_size, description) values(1,  'XS');
insert into size(id_size, description) values(2,  'S');
insert into size(id_size, description) values(3,  'M');
insert into size(id_size, description) values(4,  'L');
insert into size(id_size, description) values(5,  'XL');
insert into size(id_size, description) values(6,  '2XL');
insert into size(id_size, description) values(7,  '2');
insert into size(id_size, description) values(8,  '2S');
insert into size(id_size, description) values(9,  '4');
insert into size(id_size, description) values(10,  '4S');
insert into size(id_size, description) values(11,  '4L');
insert into size(id_size, description) values(12,  '6');
insert into size(id_size, description) values(13,  '6S');
insert into size(id_size, description) values(14,  '6L');
insert into size(id_size, description) values(15,  '8');
insert into size(id_size, description) values(16,  '8S');
insert into size(id_size, description) values(17,  '8L');
insert into size(id_size, description) values(18,  '10');
commit;


insert into product_category_size(id_product_category, id_size)
select 
   cat.id_product_category,
   siz.id_size
from product_category cat
join size siz on (siz.id_size between 2 and 6)
where cat.id_product_category between 1 and 5;

commit;

insert into offer(id_offer, description, discount) values(1, 'Summer Sales - 15% OFF', 15);

insert into offer(id_offer, description, discount) values(2, 'Collection Shift - 25% OFF', 25);

commit;


update product set id_offer = 1 where id_product = 'bQTsNoDSBKxsjkL';
update product set id_offer = 1 where id_product = 'cuLYSahgJKnJSVa';
update product set id_offer = 2 where id_product = 'dGdKCpXRaLEDUqu';
update product set id_offer = 2 where id_product = 'dqhOpFXJOAhhTWF';
update product set id_offer = 2 where id_product = 'DyjPKRiShpMXoHq';

commit;

insert into payment_method(description) values('Credit Card');
insert into payment_method(description) values('Debit Card');
insert into payment_method(description) values('Bank Transfer');
insert into payment_method(description) values('Google Pay');

commit;


create table product_rating
(
   id_product_rating int not null auto_increment,
   id_product varchar(15) not null,
   rating int not null,
   review_count int not null,
   constraint pk_product_rating primary key(id_product_rating)
);

alter table product_rating add constraint fk_product_rating_prod foreign key(id_product) references product(id_product) on delete cascade;

update payment_method set description = 'Debit Card number xxxx-xxxx-xxxx-1111', image = '/sales/img/american-express.png'
where id_payment_method = 1;

update payment_method set description = 'Credit Card number xxxx-xxxx-xxxx-2222', image = '/sales/img/visa.png'
where id_payment_method = 2;

update payment_method set description = 'PayPal', image = '/sales/img/paypal.png'
where id_payment_method = 3;

update payment_method set description = 'Google Pay', image = '/sales/img/google-pay.png'
where id_payment_method = 4;

commit;

alter table sale_order add delivery_forecast datetime;

insert into product_category(id_product_category, description) values(6, 'Jeans');

insert into product_category(id_product_category, description) values(7, 'Skirts');

insert into product_category(id_product_category, description) values(8, 'Suits');


insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Jeans Revolution Denim', 18,6,104.18,2,3,6, 'EAHcohciLvEHNEa', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Denim Jeans Shorts Paper', 19,6,45.58,3,3,1, 'ENwiTVywmqjKRKr', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Jeans Denim Skirt', 20,6,57.59,4,2,2, 'EqrbBOhVVaNTCNm', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Jeans Trousers Denim', 21,6,94.84,4,2,5, 'EtfRkeKetdRvVNy', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Denim Jeans Clothing Blue Shorts', 22,6,75.64,2,4,1, 'FfldqhnKdHwJmIX', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Jeans Paper Denim', 23,6,30.52,4,1,6, 'FMRvqovvOXuphHt', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Red Luxury Skirt', 24,7,30.64,2,5,3, 'fmuHFPfpiMrMuhw', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Skirt Dress Kit Black', 25,7,70.56,2,3,4, 'FQnWEhkhwuLuhxX', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Cream Casual Skirt', 26,7,101.98,3,5,1, 'gJcMKUgasXjIGTl', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Royal Luxury Skirt', 27,7,87.39,2,5,2, 'heIYTnltaKWLxRN', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Ice White Short Skirt', 28,7,67.65,2,3,4, 'HgNJtOrQpAqvqlI', 'F');
insert into product(description, id_image, id_product_category, price, user_rating, user_fit_sizing, id_brand, id_product, genre) values('Notched Two-Button Blazer & Pencil Skirt', 29,8,81.2,3,5,4, 'hIPLmbNGgowCwbL', 'F');
commit;


insert into product_category_size(id_product_category, id_size)
select 
   cat.id_product_category,
   siz.id_size
from product_category cat
join size siz on (siz.id_size between 1 and 5)
where cat.id_product_category between 6 and 8;

commit;