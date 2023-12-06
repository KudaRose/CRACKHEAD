create table Usuarios(
	idUser int not null,
	username varchar(15),
    pwrd varchar(15),
    correo varchar(45),
    primary key(idUser)
    );
    
create table productos(
	idProducto int not null,
    marca varchar(45),
    modelo varchar(45),
	color varchar(45),
    talle int,
    tienda varchar(45),
    URL varchar(80),
    primary key(idProducto)
    );

create table Fav_x_usr(
	idFav int not null,
    iduser int not null,
    idproduct int not null,
    foreign key (iduser) references Usuarios(idUser),
    foreign key (idproduct) references Productos(idProducto)
    );