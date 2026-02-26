ALTER TABLE Aangepaste_Placeholder 
ADD COLUMN document_id INT NULL,
ADD COLUMN bron_text TEXT NULL,
ADD COLUMN pagina_nummer INT NULL,
ADD CONSTRAINT fk_aangepaste_placeholder_document
FOREIGN KEY (document_id) REFERENCES Documenten(document_id) ON DELETE SET NULL;
