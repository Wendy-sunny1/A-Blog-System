
DROP TABLE IF EXISTS subscribe;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id INTEGER NOT NULL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    realname VARCHAR(64),
    dob DATE NOT NULL,
    description TEXT NOT NULL,
    avatarid INTEGER NOT NULL,
    authToken VARCHAR(128),
    avatarFileName varchar(500)
);

CREATE TABLE articles (
    id INTEGER NOT NULL PRIMARY KEY,
    title TEXT,
    publishTime DATETIME,
    content TEXT,
    imageURL TEXT,
    userID INTEGER NOT NULL,
    likeCount INTEGER,
    FOREIGN KEY (userID) REFERENCES users (id) on delete cascade
);

CREATE TABLE comments (
    id INTEGER NOT NULL PRIMARY KEY,
    texts TEXT,
    commentTime DATETIME,
    replyToCommentID INTEGER,
    isHidden BOOLEAN,
    userID INTEGER NOT NULL ,
    articleID INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES users (id) on delete cascade,
    FOREIGN KEY (articleID) REFERENCES articles (id) on delete cascade
);

CREATE TABLE likes (
    userID INTEGER,
    articleID INTEGER,
    PRIMARY KEY (userID, articleID),
    FOREIGN KEY (userID) REFERENCES users (id) on delete cascade,
    FOREIGN KEY (articleID) REFERENCES articles (id) on delete cascade
);

CREATE TABLE subscribe (
    subscriberID INTEGER,
    authorID INTEGER,
    PRIMARY KEY (subscriberID, authorID),
    FOREIGN KEY (subscriberID) REFERENCES users (id) on delete cascade,
    FOREIGN KEY (authorID) REFERENCES users (id) on delete cascade
);

CREATE TABLE notification (
    notificateID INTEGER NOT NULL PRIMARY KEY,
    content TEXT,
    currentUserID INTEGER,
    noticeReceiverID INTEGER,
    isClicked BOOLEAN,
    FOREIGN KEY (noticeReceiverID) REFERENCES users (id) on delete cascade
);

INSERT INTO users (id, username, password, realname, dob, description, avatarid, avatarFileName) VALUES (1, 'zdon070', '$2b$10$QUmJ5sKhlzBkOStvaP./vuuAeGi7Mh9lW61C.wVSAk4SRBe.6nkYK', 'Ian', '1996-12-29', 'Movie fans, Math gen', 2,'2.png');
INSERT INTO users (id, username, password, realname, dob, description, avatarid, avatarFileName) VALUES (2, 'szho231', '$2b$10$BRw2vO2RSLKFYPDhkETlPeECrKsAJrGKTG1U53d.5Qo27KHhMEkIu', 'Sherry', '1999-10-13', 'Cat person, vegetarian', 3, '3.png');
INSERT INTO users (id, username, password, realname, dob, description, avatarid, avatarFileName) VALUES (3, 'wche751', '$2b$10$wAwSwHnDlOUPiqryAj4.5e5YvT9gNLq71cJc2.SmyvWJXeyGaOKVi', 'Wendy', '1982-10-29', 'Romantics, Kiwi', 3, '3.png');
INSERT INTO users (id, username, password, realname, dob, description, avatarid, avatarFileName) VALUES (4, 'bxia138', '$2b$10$dbYbXltFC57raUZ0V/1mR.u9rMR9L62mNBbbwOzNPok9PYrZCgFJy', 'Jason', '1998-10-17', 'Business prodigy, cat person', 1, '1.png');
INSERT INTO users (id, username, password, realname, dob, description, avatarid, avatarFileName) VALUES (5, 'pli791', '$2b$10$89PjF1YFUNakeMVMNzR0z.wVQ6wfaujbhph0VGSu8Rbh2VYVXIfDW', 'Packy', '1996-10-16', 'Peace, Foodie', 2, '2.png');

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES 
(1, 'The Shawshank Redemption','2023-09-09 15:30:00', '<h1>The Shawshank Redemption</h1>
<p>The Shawshank Redemption is a cinematic gem that has left an indelible mark on the hearts of viewers worldwide since its 1994 release. Directed by Frank Darabont and based on a Stephen King novella, the film is a brilliant portrayal of hope, friendship, and the resilience of the human spirit. Set in Shawshank State Penitentiary, the story revolves around Andy Dufresne (Tim Robbins), wrongly convicted of a double murder, and his enduring friendship with fellow inmate Red (Morgan Freeman).</p>
<p>The performances in this film are nothing short of exceptional. Tim Robbins infuses Andy with quiet strength, and Morgan Freeman portrayal of Red is a narrative anchor. Their chemistry is palpable, making their friendship one of the film most heartwarming aspects. The supporting cast, cinematography by Roger Deakins, and Thomas Newman haunting score all contribute to the film enduring impact. "The Shawshank Redemption" is a profound exploration of the human condition, reminding us that hope can thrive even in the darkest of circumstances. Its themes of transformation, justice, and the quest for meaning continue to resonate, making it a timeless classic in the world of cinema.</p>
', '/uploadedImgs/1.png', 1, 35);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES 
(2, 'The Godfather','2023-07-28 17:32:59', '<h1>The Godfather</h1><p>The Godfather, directed by Francis Ford Coppola and based on Mario Puzo novel, is an iconic cinematic masterpiece that has held a firm place in film history since its release in 1972. This classic crime drama paints a vivid picture of the Corleone family, a powerful Italian-American mafia clan, and their patriarch, Vito Corleone, played by Marlon Brando. The film storytelling prowess and its portrayal of organized crime are nothing short of exceptional.</p>
<p>The performances in The Godfather are legendary. Marlon Brando portrayal of Vito Corleone is a masterclass in acting, and his gravitas and presence on screen are unforgettable. Al Pacino transformation from an outsider to a ruthless, calculating mafia boss is a captivating journey. The film ensemble cast, including James Caan, Robert Duvall, and Diane Keaton, delivers performances that define their careers. Cinematographer Gordon Willis creates a visually stunning and evocative atmosphere, and Nino Rota score is hauntingly beautiful.</p>
<p>The Godfather enduring legacy is a testament to its storytelling depth and its exploration of themes like power, family, and the cost of ambition. The film portrayal of the mafia world is both gritty and glamorous, making it a compelling and complex narrative. Its influence on subsequent crime films is immeasurable, and it continues to be a touchstone for cinema enthusiasts. The Godfather is a timeless classic that remains a crowning achievement in filmmaking.</p>
','/uploadedImgs/2.png', 2, 9);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES 
(3, 'The Dark Knight','2023-03-13 09:27:13', '<h1>The Dark Knight</h1><p>The Dark Knight, directed by Christopher Nolan and released in 2008, is a remarkable entry in the superhero genre that transcends its origins to become a complex and gripping crime drama. The film explores the concept of vigilantism and the blurred lines between good and evil. At its heart is Christian Bale portrayal of Batman, a symbol of hope and justice in Gotham City.</p>
<p>One of the standout elements of The Dark Knight is Heath Ledger iconic performance as the Joker. Ledger interpretation of the character is chilling and unforgettable, earning him a posthumous Academy Award. The film supporting cast, including Aaron Eckhart as Harvey Dent/Two-Face and Gary Oldman as Commissioner Gordon, is equally impressive. Nolan direction is taut, and Hans Zimmer score adds a pulsating, ominous atmosphere to the narrative.</p>
<p>The Dark Knight legacy in the superhero genre is unparalleled. It set a new standard for what comic book adaptations could achieve, delving into the psyche of its characters and presenting a morally complex world. The film exploration of chaos and the nature of heroism still resonates with audiences. The Dark Knight is not just a great superhero movie; it a great movie, period, and its impact on cinema is undeniable.</p>
','/uploadedImgs/3.png', 3, 52);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES 
(4, 'Intersteller','2023-10-08 22:15:47', '<h1>Intersteller</h1><p>Interstellar, directed by Christopher Nolan and released in 2014, is a breathtaking and thought-provoking science fiction epic that explores the boundless possibilities of space and the enduring spirit of humanity. The film takes us on a journey through wormholes, black holes, and distant planets, all while examining the complexities of time and love.</p>
<p>Matthew McConaughey leads the cast with a compelling performance as Cooper, a pilot and engineer tasked with finding a new habitable planet for Earth dwindling population. Anne Hathaway, Jessica Chastain, and Michael Caine deliver strong supporting performances. Hans Zimmer score adds a haunting and evocative dimension to the film, enhancing the emotional impact of the story.</p>
<p>Interstellar legacy in the science fiction genre is profound. The film scientific accuracy and its exploration of the human spirit in the face of seemingly insurmountable challenges have resonated with audiences. It challenges our understanding of space and time while weaving a deeply emotional narrative. Interstellar is a cinematic journey of epic proportions, and its impact on both the genre and our collective imagination is undeniable.</p>
','/uploadedImgs/4.png', 4, 88);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES 
(5, 'Inception','2023-05-20 12:46:02', '<h1>Inception</h1><p>Inception, directed by Christopher Nolan and released in 2010, is a mind-bending and visually stunning science fiction thriller that challenges the very nature of reality. This film is a journey into the labyrinthine depths of dreams and subconsciousness, where ideas and secrets are the most valuable currency. Nolan storytelling prowess and innovative approach to the genre have made Inception a modern classic, redefining the way we think about dreams and the power of the human mind.</p>
<p>Leonardo DiCaprio leads the cast with a compelling performance as Dom Cobb, a skilled extractor who infiltrates the dreams of others to steal their ideas. His portrayal of Cobb complex emotions and inner turmoil is a testament to his acting prowess. The film ensemble cast, including Joseph Gordon-Levitt, Ellen Page, and Tom Hardy, adds depth to the narrative. Hans Zimmer score, with its iconic blaring horns, enhances the tension and suspense, creating an integral layer of the film atmosphere.</p>
<p>Inception legacy in the science fiction genre is profound. The concept of shared dreaming, the idea of constructing dreams within dreams, and the spinning top that tantalizingly questions reality have become cultural touchstones. Nolan meticulous attention to detail and practical effects have set a high bar for the genre. Inception invites audiences to engage with its intricate layers and explore the philosophical questions it raises. It a film that continues to spark conversations and debates, making it an enduring masterpiece in modern cinema.</p>
','', 5, 26);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES 
(6, 'The Lord of the Rings','2023-05-23 14:46:02', '<h1>The Lord of the Rings</h1><p>The Lord of the Rings, directed by Peter Jackson and released in the early 2000s, is an epic fantasy film series that has left an indelible mark on the genre. Adapted from J.R.R. Tolkien novels, this cinematic masterpiece takes audiences on a breathtaking journey through the mythical land of Middle-earth, replete with rich characters and a compelling narrative.</p>
<p>Elijah Wood leads the cast with a compelling performance as Frodo Baggins, a humble hobbit who becomes the unlikely hero entrusted with destroying the One Ring. His portrayal of Frodo courage and vulnerability is a testament to his acting prowess. The film ensemble cast, including Ian McKellen, Viggo Mortensen, and Liv Tyler, adds depth to the narrative. Howard Shore score enhances the sweeping grandeur of the story, creating an emotional connection with the characters and their quest.</p>
<p>The Lord of the Rings legacy in the fantasy genre is unparalleled. The films world-building, intricate lore, and memorable characters have set a high standard for adaptations of this kind. The exploration of themes such as friendship, heroism, and the corrupting influence of power resonates deeply with audiences. The Lord of the Rings is more than just a film series; it a cultural phenomenon that has shaped the way we perceive and enjoy epic fantasy stories.</p>
<p>The visual effects and practical stunts in The Lord of the Rings are nothing short of spectacular. From the awe-inspiring landscapes of New Zealand to the intricate designs of mythical creatures, the films offer a visually immersive experience. The battles, from the sprawling fields of Pelennor to the claustrophobic mines of Moria, are masterfully choreographed and executed. The use of practical effects, combined with CGI, creates a seamless blend of reality and fantasy. The Lord of the Rings visual storytelling has set new standards for the fantasy genre, earning its place in cinematic history.</p>
','/uploadedImgs/5.png', 1, 15);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(7, 'Pulp Fiction', '2023-10-16 16:00:00', '<h1>Pulp Fiction</h1><p>Pulp Fiction, directed by Quentin Tarantino and released in 1994, is a cult classic that redefined the crime film genre. This non-linear narrative weaves together interconnected stories of hitmen, boxers, and mob bosses in a world where violence and dark humor collide. Tarantino storytelling style and his ensemble cast make Pulp Fiction an unforgettable cinematic experience.</p><p>John Travolta, Uma Thurman, and Samuel L. Jackson lead the cast with memorable performances. The film non-linear structure challenges the conventional way of storytelling and keeps the audience engaged. The eclectic soundtrack, featuring classic rock and surf music, adds to the film unique atmosphere. Pulp Fiction is a gritty and stylized exploration of crime, redemption, and the absurdity of human behavior.</p><p>The film has had a lasting impact on cinema, popular culture, and the crime genre. Its quotable dialogue, memorable characters, and bold narrative choices have made it a touchstone for aspiring filmmakers. Pulp Fiction is a cult classic that continues to captivate and challenge its viewers, making it a defining work in the world of independent cinema.</p>
', '/uploadedImgs/6.jpg', 2, 8);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(8, 'The Matrix', '2023-07-08 16:45:00', '<h1>The Matrix</h1><p>The Matrix, directed by the Wachowskis and released in 1999, is a groundbreaking science fiction film that redefined the genre. This mind-bending story follows Neo, played by Keanu Reeves, as he discovers the truth about the simulated reality in which humanity is trapped. The film visual effects, action sequences, and philosophical themes have left an enduring impact on popular culture.</p><p>Keanu Reeves performance as Neo is iconic. The film ensemble cast, including Laurence Fishburne and Carrie-Anne Moss, adds depth to the narrative. The groundbreaking special effects, including the famous bullet-dodging scene, set new standards for the industry. The Matrix is a visual spectacle with a complex and thought-provoking narrative.</p><p>The Matrix exploration of reality, artificial intelligence, and the nature of control resonates with contemporary concerns about technology and surveillance. The film stylish and dystopian world has made it a touchstone for cyberpunk aesthetics. The Matrix is not just a movie; it is a cultural phenomenon that continues to influence the way we think about the digital age.</p>
', '/uploadedImgs/7.jpg', 3, 13);


INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(9, 'Forrest Gump', '2023-02-23 10:32:00', '<h1>Forrest Gump</h1><p>Forrest Gump, directed by Robert Zemeckis and released in 1994, is a heartwarming and iconic tale of a simple man with extraordinary experiences. Tom Hanks delivers a remarkable performance as Forrest, a man with a low IQ but a big heart, who unwittingly influences the course of American history. The film is a poignant exploration of love, destiny, and the American dream.</p><p>Tom Hanks portrayal of Forrest is endearing and unforgettable. The film ensemble cast, including Robin Wright and Gary Sinise, creates a rich tapestry of characters in Forrest life. The soundtrack, featuring iconic songs of the era, adds to the film emotional resonance. Forrest Gump is a timeless story of an ordinary man who leads an extraordinary life.</p><p>The film themes of love and perseverance have made it a classic. Forrest journey through significant historical events and his unwavering devotion to Jenny captivate the audience. Forrest Gump is a heartwarming and inspirational film that reminds us of the beauty of life and the power of kindness.</p>
', '/uploadedImgs/8.jpg', 4, 8);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(10, 'The Silence of the Lambs', '2023-01-22 17:45:00', '<h1>The Silence of the Lambs</h1><p>The Silence of the Lambs, directed by Jonathan Demme and released in 1991, is a chilling psychological thriller that has become a classic of the genre. The film follows Clarice Starling, portrayed by Jodie Foster, a young FBI trainee who seeks the help of the brilliant but insane Dr. Hannibal Lecter, played by Anthony Hopkins, to capture a serial killer. The film is a masterclass in suspense and tension.</p><p>Anthony Hopkins portrayal of Hannibal Lecter is iconic and earned him an Academy Award. Jodie Foster performance as Clarice is equally compelling. The film ensemble cast, including Scott Glenn and Ted Levine, adds depth to the narrative. Howard Shore score enhances the film atmosphere of dread and intrigue. The Silence of the Lambs is a cinematic experience that delves into the darkest corners of the human psyche.</p><p>The film exploration of the mind of a serial killer and the psychological cat-and-mouse game between Clarice and Lecter has left a profound impact on the thriller genre. The Silence of the Lambs is a film that continues to disturb and fascinate audiences, earning its place among the most psychologically intense thrillers in cinematic history.</p>
', '/uploadedImgs/9.jpg', 5, 5);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(11, 'Seven', '2023-03-02 19:15:36', '<h1>Seven</h1><p>Seven, directed by David Fincher and released in 1995, is a dark and disturbing crime thriller that explores the seven deadly sins. Detectives David Mills, portrayed by Brad Pitt, and William Somerset, played by Morgan Freeman, are on the trail of a serial killer who uses these sins as his modus operandi. The film is a psychological and gruesome journey into the depths of human depravity.</p><p>Brad Pitt and Morgan Freeman deliver compelling performances as detectives with contrasting worldviews. The film portrayal of the grisly crime scenes and the meticulous nature of the killer work is haunting. Howard Shore score adds to the film atmosphere of dread. Seven is a thriller that delves into the darkness of the human soul.</p><p>The film exploration of the seven deadly sins and its shocking climax have made it a standout in the crime thriller genre. Seven is a disturbing and thought-provoking film that lingers in the minds of viewers, challenging them to confront the darkness within themselves.</p>
', '', 1, 17);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(12, 'Fight Club', '2023-08-11 19:30:00', '<h1>Fight Club</h1><p>Fight Club, directed by David Fincher and released in 1999, is a subversive and thought-provoking film that challenges societal norms. The story follows an insomniac office worker, portrayed by Edward Norton, who forms an underground fight club with the charismatic and anarchic Tyler Durden, played by Brad Pitt. The film explores themes of consumerism, identity, and rebellion.</p><p>Edward Norton and Brad Pitt give compelling performances that embody the film nihilistic spirit. The film visual style, with its iconic subliminal flashes and gritty aesthetic, enhances the sense of disorientation. The soundtrack, featuring The Dust Brothers, adds to the film edginess. Fight Club is a cinematic journey into the disillusionment of modern life.</p>
', '/uploadedImgs/10.jpg', 2, 15);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(13, 'The Prestige', '2023-09-23 20:15:00', '<h1>The Prestige</h1><p>The Prestige, directed by Christopher Nolan and released in 2006, is a riveting and mind-bending thriller that explores the world of magic and obsession. The film tells the story of two magicians, Robert Angier, portrayed by Hugh Jackman, and Alfred Borden, played by Christian Bale, who become bitter rivals in their quest to create the ultimate illusion. The Prestige is a tale of sacrifice, deception, and the blurred line between reality and illusion.</p><p>Hugh Jackman and Christian Bale deliver outstanding performances as the dueling magicians. The film intricate narrative structure, with its multiple timelines, creates a sense of mystery and intrigue. David Julyan haunting score adds to the film atmosphere. The Prestige is a cinematic puzzle that keeps audiences guessing until the very end.</p><p>The film exploration of the nature of secrets and the sacrifices made for the sake of art is compelling. The Prestige is a film that rewards repeated viewings as audiences uncover its hidden layers. It is a testament to Christopher Nolan ability to craft complex and emotionally resonant narratives.</p>
', '/uploadedImgs/11.jpg', 3, 21);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(14, 'The Departed', '2023-09-23 09:45:37', '<h1>The Departed</h1><p>The Departed, directed by Martin Scorsese and released in 2006, is a gritty and intense crime drama set in the world of organized crime in Boston. The film follows two moles, Billy Costigan, portrayed by Leonardo DiCaprio, and Colin Sullivan, played by Matt Damon, who infiltrate opposite sides of the law. The film explores themes of deception, identity, and betrayal.</p><p>Leonardo DiCaprio and Matt Damon deliver gripping performances as the undercover officers. The film ensemble cast, including Jack Nicholson and Mark Wahlberg, adds depth to the narrative. Howard Shore score enhances the film tension and suspense. The Departed is a relentless and morally complex exploration of the criminal underworld.</p><p>The film dual narratives and its portrayal of the cat-and-mouse game between Costigan and Sullivan have left a lasting impact. The Departed is a crime thriller that combines Scorsese signature style with a gripping narrative. It is a cinematic experience that keeps audiences on the edge of their seats.</p>
', '', 4, 5);

INSERT INTO articles (id, title, publishTime, content, imageURL, userID, likeCount) VALUES
(15, 'City of God', '2023-02-14 23:59:00', '<h1>City of God</h1><p>City of God, directed by Fernando Meirelles and Kátia Lund and released in 2002, is a visceral and unflinching crime drama that explores the gritty world of the favelas in Rio de Janeiro. The film follows the lives of two friends, Rocket and Lil Ze, as they navigate the dangers and complexities of growing up in a violent neighborhood. City of God is a raw and emotionally charged portrayal of survival and ambition.</p><p>The film features a largely unknown ensemble cast, including Alexandre Rodrigues and Leandro Firmino. Their authentic performances capture the intensity of life in the favelas. The film kinetic and documentary-style cinematography adds to the sense of immediacy. The soundtrack, featuring Brazilian funk and hip-hop, enhances the film energy. City of God is a cinematic journey that brings the streets of Rio to life.</p><p>The film portrayal of the cycle of violence and its impact on the young residents of the favela has made it a powerful and thought-provoking work. City of God is a gritty and uncompromising film that resonates with audiences far beyond its setting. It is a testament to the talent of its filmmakers and cast.</p>
', '', 5, 5);


INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES 
(1, 'Visually stunning with a gripping storyline and powerful performances','2023-10-20 12:46:02', 2, FALSE, 1, 3);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES 
(2, 'A cinematic masterpiece that leaves a lasting emotional impact.','2023-10-19 13:46:02', NULL, FALSE, 1, 9);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES 
(3, 'I love this blog so much! Excellent essay!!:))','2023-10-17 14:46:02', NULL, FALSE, 2, 11);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES 
(4, 'A rollercoaster of emotions from start to finish.','2023-10-16 15:46:02', NULL, FALSE, 3, 13);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES 
(5, 'A thought-provoking exploration of human nature and society','2023-10-15 16:46:02', 5, FALSE, 4, 5);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES 
(6, 'An unforgettable journey through the human experience','2023-10-14 16:46:02', 5, FALSE, 3, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(7, 'I love this Excellent essay!!:))','2023-10-13 14:46:09', 3, FALSE, 2, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(8, 'Excellent essay!!:))','2023-10-12 14:50:09', 3, FALSE, 3, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(9, 'Joking me:))','2023-10-10 15:50:09', 6, FALSE, 4, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(10, 'Joking me:)) Ahhhhhhh.....','2023-10-11 15:53:09', 6, FALSE, 3, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(11, 'A testament to the artistry of storytelling and filmmaking.','2023-10-13 15:50:09', 6, FALSE, 4, 13);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(12, 'Captivating, with characters you remember long after the credits roll.','2023-10-18 15:53:09', 3, FALSE, 4, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(13, 'A brilliant fusion of suspense, drama, and exceptional acting.','2023-10-19 14:46:02', NULL, FALSE, 5, 6);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(14, 'I never see this kind of essay!!:))','2023-10-19 14:46:02', NULL, FALSE, 1, 5);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(15, 'A timeless classic that transcends generational boundaries.','2023-10-19 14:46:02', NULL, FALSE, 5, 6);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(16, 'A must-watch for lovers of cinema and storytelling.','2023-10-19 14:46:02', NULL, FALSE, 1, 11);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(17, 'A testament to the artistry of storytelling and filmmaking.','2023-10-19 14:46:02', NULL, FALSE, 2, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(18, 'An unforgettable journey through the human experience.','2023-10-19 14:46:02', NULL, FALSE, 2, 11);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(19, 'A journey that lingers in your thoughts long after it ends.','2023-10-18 14:46:02', NULL, FALSE, 3, 6);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(20, 'A gripping tale that keeps you on the edge of your seat.','2023-10-17 14:46:02', NULL, FALSE, 4, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(21, 'A true gem that captures the essence of the human experience.','2023-10-16 14:46:02', NULL, FALSE, 2, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(22, 'Transcends time, leaving an indelible mark on the soul.','2023-10-15 14:46:02', NULL, FALSE, 4, 1);
INSERT INTO comments (id, texts, commentTime, replyToCommentID, isHidden, userID, articleID) VALUES
(23, 'Dazzling performances and a compelling narrative make it unforgettable.','2023-10-19 14:46:02', NULL, FALSE, 1, 15);

INSERT INTO likes (userID, articleID) VALUES (1, 3);
INSERT INTO likes (userID, articleID) VALUES (1, 4);
INSERT INTO likes (userID, articleID) VALUES (1, 5);
INSERT INTO likes (userID, articleID) VALUES (2, 3);
INSERT INTO likes (userID, articleID) VALUES (2, 4);
INSERT INTO likes (userID, articleID) VALUES (4, 5);
INSERT INTO likes (userID, articleID) VALUES (5, 1);
INSERT INTO likes (userID, articleID) VALUES (3, 6);
INSERT INTO likes (userID, articleID) VALUES (1, 6);

INSERT INTO subscribe (subscriberID, authorID) VALUES (5, 1);
INSERT INTO subscribe (subscriberID, authorID) VALUES (3, 2);
INSERT INTO subscribe (subscriberID, authorID) VALUES (3, 4);
INSERT INTO subscribe (subscriberID, authorID) VALUES (3, 5);
INSERT INTO subscribe (subscriberID, authorID) VALUES (1, 5);
INSERT INTO subscribe (subscriberID, authorID) VALUES (2, 3);
INSERT INTO subscribe (subscriberID, authorID) VALUES (2, 4);
