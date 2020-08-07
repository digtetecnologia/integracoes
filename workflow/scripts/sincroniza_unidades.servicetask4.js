var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_lojas"

// Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev3.digte.com.br:8080
var FLUIG_DOMAIN = ""

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_unidades");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a matricula e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		var fluigCompanyId = getValue("WKCompany");
		var fluigUsuario = "";
		var fluigSenha = "";
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
        // 1. lojaBairro: bairro da unidade
        // 2. lojaCEP: código postal da unidade (ex. de preenchimento: '99999-999')
        // 3. lojaCelular: celular de contato da unidade
        // 4. lojaCidade: cidade em que se localiza a unidade (ex. de preenchimento: 'São Paulo')
        // 5. lojaCnpjCpf: CNPJ ou CPF de cadastro da unidade (ex. de preenchimento: '99.999.999/9999-99' ou '999.999.999-99')
        // 6. lojaComplemento: complemento do endereço da unidade (ex. de preenchimento: 'CJ 105')
        // 7. lojaEmail: e-mail de contato da unidade
        // 8. lojaEndereco: nome da rua, avenida, alameda, entre outros tipos de logradouros (ex. de preenchimento: 'Rua dos Bobos')
        // 9. lojaEstado: estado em que se localiza a unidade (ex. de preenchimento: 'SP')
        // 10. lojaCodigo: código da unidade cadastrado no seu RP ou base de dados
        // 11. lojaNome: nome unidade
        // 12. lojaNumero: numero do logradouro da unidade
        // 13. lojaPais: país onde a unidade se localiza
        // 14. lojaRazaoSocial: razão social da unidade da unidade
        // 15. lojaTelefone: telefone de contato da unidade
        // 16. nomeLojaCidade: (ex. de preenchimento: 'São Paulo - SP')
        // 17. validarEndereco: (ex. de preenchimento: 'sim' - calculará latitude e longitude com base nos dados de endereço informados / 'nao' - calculará latitude e longitude com base nos dados de endereço informados)
		// Precisamos das seguintes ações:
		// 1. Para cada unidade retornada de seu RP, preencha o objeto 'objUnidade' com as devidas informações
		// 2. Para cada 'objUnidade' criado, adicione o mesmo no array 'resultSet'

		var resultSet = [];

		// Seu trecho de código
            var lojaBairro = '';
            var lojaCEP = '';
            var lojaCelular = '';
            var lojaCidade = '';
            var lojaCnpjCpf = '';
            var lojaComplemento = '';
            var lojaEmail = '';
            var lojaEndereco = '';
            var lojaEstado = '';
            var lojaCodigo = '';
            var lojaNome = '';
            var lojaNumero = '';
            var lojaPais = '';
            var lojaRazaoSocial = '';
            var lojaTelefone = '';
            var nomeLojaCidade = '';
            var validarEndereco = '';

			var objUnidade = {
                lojaBairro: lojaBairro,
                lojaCEP: lojaCEP,
                lojaCelular: lojaCelular,
                lojaCidade: lojaCidade,
                lojaCnpjCpf: lojaCnpjCpf,
                lojaComplemento: lojaComplemento,
                lojaEmail: lojaEmail,
                lojaEndereco: lojaEndereco,
                lojaEstado: lojaEstado,
                lojaCodigo: lojaCodigo,
                lojaNome: lojaNome,
                lojaNumero: lojaNumero,
                lojaPais: lojaPais,
                lojaRazaoSocial: lojaRazaoSocial,
                lojaTelefone: lojaTelefone,
                nomeLojaCidade: nomeLojaCidade,
                validarEndereco: validarEndereco
			};

			resultSet.push(objUnidade);
		// ...

		for (var i = 0; i < resultSet.length; i++) {
			var objUnidade = resultSet[i];
			var c1 = DatasetFactory.createConstraint("lojaCodigo", objUnidade.lojaCodigo, objUnidade.lojaCodigo, ConstraintType.MUST);
			var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
			var dsUnidade = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2], null);
			
			if (dsUnidade != null && dsUnidade.rowsCount > 0) {
				if (needsToUpdate(objUnidade, dsUnidade)) {
					updateCard(dsUnidade, objUnidade, fluigCompanyId, fluigUsuario, fluigSenha);
				}
				else {
					continue;
				}
			}
			else {
				createCard(objUnidade, fluigCompanyId, fluigUsuario, fluigSenha);
			}
		}

		log.info("@@ Fim do servico sincroniza_unidades");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_unidades");
	}
}

function needsToUpdate(objUnidade, dsUnidade) {
    var update = false;
    
    if (dsUnidade.getValue(0, "lojaBairro") != objUnidade.lojaBairro ||
        dsUnidade.getValue(0, "lojaCEP") != objUnidade.lojaCEP ||
        dsUnidade.getValue(0, "lojaCelular") != objUnidade.lojaCelular ||
        dsUnidade.getValue(0, "lojaCidade") != objUnidade.lojaCidade ||
        dsUnidade.getValue(0, "lojaCnpjCpf") != objUnidade.lojaCnpjCpf ||
        dsUnidade.getValue(0, "lojaComplemento") != objUnidade.lojaComplemento ||
        dsUnidade.getValue(0, "lojaEmail") != objUnidade.lojaEmail ||
        dsUnidade.getValue(0, "lojaEndereco") != objUnidade.lojaEndereco ||
        dsUnidade.getValue(0, "lojaEstado") != objUnidade.lojaEstado ||
        dsUnidade.getValue(0, "lojaCodigo") != objUnidade.lojaCodigo ||
        dsUnidade.getValue(0, "lojaNome") != objUnidade.lojaNome ||
        dsUnidade.getValue(0, "lojaNumero") != objUnidade.lojaNumero ||
        dsUnidade.getValue(0, "lojaPais") != objUnidade.lojaPais ||
        dsUnidade.getValue(0, "lojaRazaoSocial") != objUnidade.lojaRazaoSocial ||
        dsUnidade.getValue(0, "lojaTelefone") != objUnidade.lojaTelefone ||
        dsUnidade.getValue(0, "nomeLojaCidade") != objUnidade.nomeLojaCidade ||
        dsUnidade.getValue(0, "validarEndereco") != objUnidade.validarEndereco) {
			update = true;
	}

	return update;
}

function updateCard(dsUnidade, objUnidade, fluigCompanyId, fluigUsuario, fluigSenha) {
	var cardId = dsUnidade.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objUnidade)

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

		log.info("@@ Atualizado unidade " + objUnidade.lojaCodigo + ":" + responseCode )
	}
	else {
		return false;
	}
}

function createCard (objUnidade, fluigCompanyId, fluigUsuario, fluigSenha) {
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
	
	var arrFields = returnFormFields(objUnidade)

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
						postData.append('<documentDescription>' + objUnidade.lojaNome + '</documentDescription>');
                    postData.append('</item>');
                postData.append('</card>');
        postData.append('</ws:createCard>');
        postData.append('</soapenv:Body>');
	postData.append('</soapenv:Envelope>');
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado unidade " + objUnidade.lojaCodigo + ":" + responseCode )
}

function returnFormFields(objUnidade) {    
    var arrFields = [];
    var arrColumns = ["lojaBairro", "lojaCEP", "lojaCelular", "lojaCidade", "lojaCnpjCpf", "lojaComplemento", "lojaEmail", "lojaEndereco", "lojaEstado", "lojaCodigo", "lojaNome", "lojaNumero", "lojaPais", "lojaRazaoSocial", "lojaTelefone", "nomeLojaCidade", "validarEndereco"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objUnidade[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}