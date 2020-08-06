var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_estrutura_empresa_cargo"

// Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev3.digte.com.br:8080
var FLUIG_DOMAIN = "http://dev3.digte.com.br"

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_cargos");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a matricula e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		var fluigCompanyId = getValue("WKCompany");
		var fluigUsuario = "leonardo.giraldi";
		var fluigSenha = "Digte@123";
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
		// 1. cargoId: Código do cargo
		// 2. cargoNome: Nome do cargo
		// Precisamos das seguintes ações:
		// 1. Para cada cargo retornado de seu RP, preencha o objeto 'objCargo' com as devidas informações
		// 2. Para cada 'objCargo' criado, adicione o mesmo no array 'resultSet'

		var resultSet = [];

		// Seu trecho de código
			var cargoNome = '';
			var cargoId = '';

			var objCargo = {
				cargoNome: cargoNome,
				cargoId: cargoId
			};

			resultSet.push(objCargo);
		// ...

		for (var i = 0; i < resultSet.length; i++) {
			var objCargo = resultSet[i];
			var c1 = DatasetFactory.createConstraint("cargoId", objCargo.cargoId, objCargo.cargoId, ConstraintType.MUST);
			var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
			var dsCargo = DatasetFactory.getDataset("fdwt_estrutura_empresa_cargo", null, [c1, c2], null);
			
			if (dsCargo != null && dsCargo.rowsCount > 0) {
				if (needsToUpdate(objCargo, dsCargo)) {
					updateCard(dsCargo, objCargo, fluigCompanyId, fluigUsuario, fluigSenha);
				}
				else {
					continue;
				}
			}
			else {
				createCard(objCargo, fluigCompanyId, fluigUsuario, fluigSenha);
			}
		}

		log.info("@@ Fim do servico sincroniza_cargos");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_cargos");
	}
}

function needsToUpdate(objCargo, dsCargo) {
	var update = false;

	if (dsCargo.getValue(0, "cargoId") != objCargo.cargoId || 
		dsCargo.getValue(0, "cargoNome") != objCargo.cargoNome) {
			update = true;
	}

	return update;
}

function updateCard(dsCargo, objCargo, fluigCompanyId, fluigUsuario, fluigSenha) {
	var cardId = dsCargo.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objCargo)

		var postData = new java.lang.StringBuilder();
		postData.append('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.dm.ecm.technology.totvs.com/">');
			postData.append('<soapenv:Header/>');
			postData.append('<soapenv:Body>');
				postData.append('<ws:updateCardData>');
					postData.append('<companyId>' + fluigCompanyId + '</companyId>');
					postData.append('<username>' + fluigUsuario + '</username>');
					postData.append('<password>' + fluigSenha + '</password>');
					postData.append('<cardId>' + cardId + '</cardId>');
					postData.append('<cardData>');
					for (var i = 0; i < arrFields.length; i++) {
						postData.append('<item>');
							postData.append('<field>' + arrFields[i].fieldName + '</field>');
							postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
						postData.append('</item>');
					}
					postData.append('</cardData>');
				postData.append('</ws:updateCardData>');
			postData.append('</soapenv:Body>');
		postData.append('</soapenv:Envelope>');

		var os = connection.getOutputStream();
		os.write(postData.toString().getBytes());
		os.flush();
		
		var responseCode = connection.getResponseCode();

		log.info("@@ Atualizado cargo " + objCargo.cargoId + ":" + responseCode )
	}
	else {
		return false;
	}
}

function createCard (objCargo, fluigCompanyId, fluigUsuario, fluigSenha) {
    if (parentDocumentId == 0) {
		var c1 = DatasetFactory.createConstraint("datasetName", DATASET_NAME, DATASET_NAME, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("activeVersion", true, true, ConstraintType.MUST);
		var dsDocument = DatasetFactory.getDataset("document", null, [c1, c2], null);

		if (dsDocument != null && dsDocument.rowsCount > 0) {
			parentDocumentId = dsDocument.getValue(0, "documentPK.documentId");
			colleagueId = dsDocument.getValue(0, "colleagueId");
		}
    }
    
	var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
	var javaNetUrl = new java.net.URL(serviceUrl);

	var connection = javaNetUrl.openConnection();
    connection.setDoOutput(true);
    connection.setRequestMethod("POST");
    connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
	connection.setRequestProperty("SOAPAction", "createCard");
	
	var arrFields = returnFormFields(objCargo)

	var postData = new java.lang.StringBuilder();
    postData.append('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.dm.ecm.technology.totvs.com/">');
        postData.append('<soapenv:Header/>');
        postData.append('<soapenv:Body>');
            postData.append('<ws:createCard>');
                postData.append('<companyId>' + fluigCompanyId + '</companyId>');
                postData.append('<username>' + fluigUsuario + '</username>');
                postData.append('<password>' + fluigSenha + '</password>');
                postData.append('<card>');
                    postData.append('<item>');
                    for (var i = 0; i < arrFields.length; i++) {
                        postData.append('<cardData>');
                            postData.append('<field>' + arrFields[i].fieldName + '</field>');
                            postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
                        postData.append('</cardData>');
                    }
						postData.append('<parentDocumentId>' + parentDocumentId + '</parentDocumentId>');
						postData.append('<documentDescription>' + objCargo.cargoNome + '</documentDescription>');
                    postData.append('</item>');
                postData.append('</card>');
        postData.append('</ws:createCard>');
        postData.append('</soapenv:Body>');
	postData.append('</soapenv:Envelope>');
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado cargo " + objCargo.cargoId + ":" + responseCode )
}

function returnFormFields(objCargo) {    
    var arrFields = [];
    var arrColumns = ["cargoId", "cargoNome"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objCargo[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}